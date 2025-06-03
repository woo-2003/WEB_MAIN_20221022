import { session_set, session_get, session_check } from './session.js';
import { encrypt_text, decrypt_text } from './js_crypto.js';
import { generateJWT, checkAuth } from './js_jwt_token.js';
import { encryptData, decryptData } from './Crypto2.js';

// 로그인 실패 관련 상수
const MAX_LOGIN_FAILS = 3; // 최대 실패 횟수
const LOGIN_BLOCK_TIME = 60; // 제한 시간(초)

// 로그인 실패 처리 함수
function login_failed() {
    let failCount = parseInt(getCookie("login_fail_count") || "0");
    failCount++;
    
    // 실패 횟수 저장
    setCookie("login_fail_count", failCount.toString(), 1);
    
    // 실패 시간 저장
    if (failCount >= MAX_LOGIN_FAILS) {
        const blockUntil = new Date().getTime() + (LOGIN_BLOCK_TIME * 1000);
        setCookie("login_block_until", blockUntil.toString(), 1);
    }
    
    return failCount;
}

// 로그인 제한 상태 확인
function check_login_block() {
    const failCount = parseInt(getCookie("login_fail_count") || "0");
    const blockUntil = parseInt(getCookie("login_block_until") || "0");
    const currentTime = new Date().getTime();
    
    if (failCount >= MAX_LOGIN_FAILS && currentTime < blockUntil) {
        const remainingTime = Math.ceil((blockUntil - currentTime) / 1000);
        alert(`로그인이 제한되었습니다.\n남은 시간: ${remainingTime}초\n실패 횟수: ${failCount}회`);
        return true;
    }
    
    // 제한 시간이 지났으면 카운트 초기화
    if (currentTime >= blockUntil && failCount >= MAX_LOGIN_FAILS) {
        setCookie("login_fail_count", "0", 0);
        setCookie("login_block_until", "0", 0);
    }
    
    return false;
}

// 로그인 성공 시 실패 카운트 초기화
function reset_login_fail_count() {
    setCookie("login_fail_count", "0", 0);
    setCookie("login_block_until", "0", 0);
}

// 로그인/로그아웃 카운트 함수 추가
function login_count() {
    let count = parseInt(getCookie("login_cnt") || "0");
    count++;
    setCookie("login_cnt", count.toString(), 365); // 1년간 유지
    console.log("로그인 횟수:", count);
}

function logout_count() {
    let count = parseInt(getCookie("logout_cnt") || "0");
    count++;
    setCookie("logout_cnt", count.toString(), 365); // 1년간 유지
    console.log("로그아웃 횟수:", count);
}

// init 함수를 window 객체에 할당하여 전역에서 접근 가능하게 함
window.init = function(){ // 로그인 폼에 쿠키에서 가져온 아이디 입력
    const emailInput = document.getElementById('typeEmailX');
    const idsave_check = document.getElementById('idSaveCheck');
    let get_id = getCookie("id");

    console.log("저장된 아이디:", get_id);

    if(get_id && get_id !== "") {
        emailInput.value = get_id;
        idsave_check.checked = true;
    }
    
    // 로그인 제한 상태 확인 및 표시
    const failCount = parseInt(getCookie("login_fail_count") || "0");
    const blockUntil = parseInt(getCookie("login_block_until") || "0");
    const currentTime = new Date().getTime();
    
    if (failCount > 0) {
        if (currentTime < blockUntil) {
            const remainingTime = Math.ceil((blockUntil - currentTime) / 1000);
            alert(`현재 로그인 실패 횟수: ${failCount}회\n남은 제한 시간: ${remainingTime}초`);
        } else {
            alert(`현재 로그인 실패 횟수: ${failCount}회`);
        }
    }
    
    session_check(); // 세션 유무 검사
    checkAuth(); // 토큰 검증 추가
}

async function init_logined(){
    if(sessionStorage){
        try {
            // 기존 복호화 방식 유지
            const decryptedData = await decrypt_text();
            if (decryptedData) {
                console.log('복호화된 데이터:', decryptedData);
            }
            
            // 세션 데이터 확인
            const sessionData = session_get();
            if (sessionData) {
                console.log('세션 데이터:', sessionData);
            }
        } catch (error) {
            console.error('세션 초기화 중 오류:', error);
        }
    }
    else{
        alert("세션 스토리지 지원 x");
    }
}

const check_xss = (input) => {
    // DOMPurify 라이브러리 로드 (CDN 사용)
    const DOMPurify = window.DOMPurify;
    // 입력 값을 DOMPurify로 sanitize
    const sanitizedInput = DOMPurify.sanitize(input);
    // Sanitized된 값과 원본 입력 값 비교
    if (sanitizedInput !== input) {
        // XSS 공격 가능성 발견 시 에러 처리
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    // Sanitized된 값 반환
    return sanitizedInput;
};

function setCookie(name, value, expiredays) {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = escape(name) + "=" + escape(value) + "; expires=" + date.toUTCString() + "; path=/";
}

function getCookie(name) {
    var cookie = document.cookie;
    console.log("쿠키를 요청합니다:", name);
    if (cookie != "") {
        var cookie_array = cookie.split("; ");
        for (var index in cookie_array) {
            var cookie_name = cookie_array[index].split("=");
            if (cookie_name[0] == name) {
                console.log("찾은 쿠키 값:", decodeURIComponent(cookie_name[1]));
                return decodeURIComponent(cookie_name[1]);
            }
        }
    } 
    console.log("쿠키를 찾을 수 없습니다:", name);
    return "";
}

const check_input = async () => {
    // 로그인 제한 상태 확인
    if (check_login_block()) {
        return false;
    }

    const loginForm = document.getElementById('login_form');
    const loginbtn = document.getElementById('login_btn');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');

    const c = '아이디, 패스워드를 체크합니다';
    alert(c);

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    const sanitizedPassword = check_xss(passwordValue);
    const sanitizedEmail = check_xss(emailValue);

    const idsave_check = document.getElementById('idSaveCheck');
    const payload = {
        id: emailValue,
        exp: Math.floor(Date.now() / 1000) + 3600 // 1시간 (3600초)
    };
    
    try {
        const jwtToken = await generateJWT(payload);
        
        // 입력값 검증
        if (emailValue === '') {
            alert('이메일을 입력하세요.');
            login_failed();
            return false;
        }

        if (passwordValue === '') {
            alert('비밀번호를 입력하세요.');
            login_failed();
            return false;
        }

        // 새로운 제한사항: 이메일 길이 제한
        if (emailValue.length > 20) {
            alert('이메일은 10글자 이하여야 합니다.');
            return false;
        }

        // 새로운 제한사항: 비밀번호 길이 제한
        if (passwordValue.length > 15) {
            alert('비밀번호는 15글자 이하여야 합니다.');
            return false;
        }

        // 새로운 제한사항: 3글자 이상 반복 입력 검사
        const hasRepeatedChars = (str) => {
            for (let i = 0; i < str.length - 2; i++) {
                if (str[i] === str[i + 1] && str[i] === str[i + 2]) {
                    return true;
                }
            }
            return false;
        };

        if (hasRepeatedChars(emailValue)) {
            alert('이메일에 3글자 이상 반복되는 문자를 사용할 수 없습니다.');
            return false;
        }

        if (hasRepeatedChars(passwordValue)) {
            alert('비밀번호에 3글자 이상 반복되는 문자를 사용할 수 없습니다.');
            return false;
        }

        // 새로운 제한사항: 연속되는 숫자 2개 이상 반복 검사
        const hasConsecutiveNumbers = (str) => {
            const numbers = str.match(/\d+/g);
            if (!numbers) return false;
            
            for (const num of numbers) {
                if (num.length >= 2) {
                    for (let i = 0; i < num.length - 1; i++) {
                        if (Math.abs(parseInt(num[i]) - parseInt(num[i + 1])) === 1) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        if (hasConsecutiveNumbers(emailValue)) {
            alert('이메일에 연속되는 숫자를 2개 이상 사용할 수 없습니다.');
            return false;
        }

        if (hasConsecutiveNumbers(passwordValue)) {
            alert('비밀번호에 연속되는 숫자를 2개 이상 사용할 수 없습니다.');
            return false;
        }

        // 기존 제한사항 유지
        if (emailValue.length < 5) {
            alert('아이디는 최소 5글자 이상 입력해야 합니다.');
            return false;
        }
        
        if (passwordValue.length < 12) {
            alert('비밀번호는 반드시 12글자 이상 입력해야 합니다.');
            return false;
        }

        const hasSpecialChar = passwordValue.match(/[!,@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/) !== null;
        if (!hasSpecialChar) {
            alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
            return false;
        }

        const hasUpperCase = passwordValue.match(/[A-Z]+/) !== null;
        const hasLowerCase = passwordValue.match(/[a-z]+/) !== null;
        if (!hasUpperCase || !hasLowerCase) {
            alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
            return false;
        }

        if (!sanitizedEmail) {
            return false;
        }
        
        if (!sanitizedPassword) {
            return false;
        }

        // 모든 검증을 통과한 경우
        reset_login_fail_count(); // 실패 카운트 초기화

        // 검사 마무리 단계 쿠키 저장, 최하단 submit 이전
        if(idsave_check.checked == true) { // 아이디 체크 o
            console.log("아이디 저장 체크됨:", emailValue);
            setCookie("id", emailValue, 1); // 1일 저장
            console.log("저장된 쿠키 값:", getCookie("id"));
        } else { // 아이디 체크 x
            console.log("아이디 저장 체크 해제됨");
            setCookie("id", "", 0); //날짜를 0 - 쿠키 삭제
        }

        console.log('이메일:', emailValue);
        console.log('비밀번호:', passwordValue);

        login_count(); // 로그인 횟수 증가
        await session_set(); // 세션 생성 (비동기 처리)
        localStorage.setItem('jwt_token', jwtToken);
        await checkAuth(); // 로그인 후 토큰 검증 추가
        
        // 세션 데이터 로깅 추가
        const sessionData = await session_get();
        console.log('세션 데이터:', sessionData);
        
        // init_logined 함수 호출
        await init_logined();
        
        loginForm.submit();
    } catch (error) {
        console.error('로그인 처리 중 오류:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        return false;
    }
};

// DOM이 완전히 로드된 후에 실행
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById("logout_btn");
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout_count(); // 로그아웃 횟수 증가
            sessionStorage.clear(); // 세션 삭제
            localStorage.removeItem('jwt_token'); // JWT 토큰 삭제
            location.href = 'login.html'; // 로그인 페이지로 이동
        });
    }

    const loginBtn = document.getElementById("login_btn");
    if (loginBtn) {
        loginBtn.addEventListener('click', check_input);
    }

    // 페이지 로드 시 토큰 검증
    checkAuth();
});




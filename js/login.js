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

// 로그인/로그아웃 카운트 함수
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

// init 함수
export function init() {
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
    checkAuth(); // 토큰 검증
}

// XSS 방지 함수
const check_xss = (input) => {
    if (!input) return '';
    
    // DOMPurify 라이브러리 사용
    const DOMPurify = window.DOMPurify;
    if (!DOMPurify) {
        console.error('DOMPurify가 로드되지 않았습니다.');
        return input;
    }
    
    // 입력 값을 DOMPurify로 sanitize
    const sanitizedInput = DOMPurify.sanitize(input);
    
    // Sanitized된 값과 원본 입력 값 비교
    if (sanitizedInput !== input) {
        console.warn('XSS 공격 가능성이 있는 입력값이 발견되었습니다.');
        return sanitizedInput;
    }
    
    return sanitizedInput;
};

// 쿠키 설정 함수
function setCookie(name, value, expiredays) {
    const date = new Date();
    date.setDate(date.getDate() + expiredays);
    const cookieValue = `${escape(name)}=${escape(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = cookieValue;
    console.log("쿠키가 설정되었습니다:", name);
}

// 쿠키 가져오기 함수
function getCookie(name) {
    const cookie = document.cookie;
    console.log("쿠키를 요청합니다:", name);
    
    if (cookie) {
        const cookieArray = cookie.split("; ");
        for (const cookieItem of cookieArray) {
            const [cookieName, cookieValue] = cookieItem.split("=");
            if (cookieName === name) {
                const value = decodeURIComponent(cookieValue);
                console.log("찾은 쿠키 값:", value);
                return value;
            }
        }
    }
    
    console.log("쿠키를 찾을 수 없습니다:", name);
    return "";
}

// 입력값 검증 함수
const validateInput = (email, password) => {
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        return false;
    }

    // 이메일 길이 검사
    if (email.length > 50) {
        alert('이메일은 50자 이하여야 합니다.');
        return false;
    }

    // 비밀번호 길이 검사
    if (password.length < 8 || password.length > 20) {
        alert('비밀번호는 8자 이상 20자 이하여야 합니다.');
        return false;
    }

    // 비밀번호 복잡성 검사
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        alert('비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.');
        return false;
    }

    return true;
};

// 로그인 처리 함수
export async function check_input() {
    try {
        // 로그인 제한 상태 확인
        if (check_login_block()) {
            return false;
        }

        const emailInput = document.getElementById('typeEmailX');
        const passwordInput = document.getElementById('typePasswordX');
        const idsave_check = document.getElementById('idSaveCheck');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // XSS 방지
        const sanitizedEmail = check_xss(email);
        const sanitizedPassword = check_xss(password);

        // 입력값 검증
        if (!validateInput(sanitizedEmail, sanitizedPassword)) {
            login_failed();
            return false;
        }

        // JWT 토큰 생성
        const payload = {
            id: sanitizedEmail,
            exp: Math.floor(Date.now() / 1000) + 3600 // 1시간
        };
        
        const jwtToken = await generateJWT(payload);
        
        // 세션에 토큰 저장
        session_set(jwtToken);
        
        // 아이디 저장 체크
        if (idsave_check.checked) {
            setCookie("id", sanitizedEmail, 365);
        } else {
            setCookie("id", "", 0);
        }

        // 로그인 성공 처리
        reset_login_fail_count();
        login_count();
        
        // 로그인 성공 후 리다이렉트
        window.location.href = "index_login.html";
        return false;
        
    } catch (error) {
        console.error("로그인 처리 중 오류 발생:", error);
        alert("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        login_failed();
        return false;
    }
}

// DOM이 로드된 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}




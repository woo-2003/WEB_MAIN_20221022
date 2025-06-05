import { startSession, checkSession, handleSessionExpiration, setSessionData, getSessionData, encryptSessionData, decryptSessionData } from './session.js';
import { encryptText, decryptText } from './js_crypto.js';
import { generateToken, verifyToken } from './js_jwt_token.js';
import { encrypt, decrypt } from './Crypto2.js';

// 로그인 실패 관련 상수
const MAX_LOGIN_FAILURES = 5;
const LOGIN_BLOCK_TIME = 30 * 60 * 1000; // 30분

// 로그인 실패 처리
function login_failed() {
    let failCount = parseInt(localStorage.getItem('login_fail_count') || '0');
    failCount++;
    localStorage.setItem('login_fail_count', failCount.toString());
    localStorage.setItem('last_fail_time', Date.now().toString());
    
    if (failCount >= MAX_LOGIN_FAILURES) {
        alert(`로그인 시도가 ${MAX_LOGIN_FAILURES}회 실패하여 ${LOGIN_BLOCK_TIME/60000}분간 로그인이 차단됩니다.`);
    } else {
        alert(`로그인 실패! (${failCount}/${MAX_LOGIN_FAILURES})`);
    }
}

// 로그인 차단 상태 확인
function check_login_block() {
    const failCount = parseInt(localStorage.getItem('login_fail_count') || '0');
    const lastFailTime = parseInt(localStorage.getItem('last_fail_time') || '0');
    
    if (failCount >= MAX_LOGIN_FAILURES) {
        const timeSinceLastFail = Date.now() - lastFailTime;
        if (timeSinceLastFail < LOGIN_BLOCK_TIME) {
            const remainingTime = Math.ceil((LOGIN_BLOCK_TIME - timeSinceLastFail) / 60000);
            alert(`로그인이 차단되어 있습니다. ${remainingTime}분 후에 다시 시도해주세요.`);
            return true;
        } else {
            reset_login_fail_count();
        }
    }
    return false;
}

// 로그인 실패 횟수 초기화
function reset_login_fail_count() {
    localStorage.removeItem('login_fail_count');
    localStorage.removeItem('last_fail_time');
}

// 로그인/로그아웃 카운트
function count_login() {
    let count = parseInt(localStorage.getItem('login_count') || '0');
    localStorage.setItem('login_count', (count + 1).toString());
}

function count_logout() {
    let count = parseInt(localStorage.getItem('logout_count') || '0');
    localStorage.setItem('logout_count', (count + 1).toString());
}

// 초기화 함수
export function init() {
    // 폼 초기화
    const loginForm = document.getElementById('login_form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await check_input();
        });
    }

    // 세션 상태 확인
    if (checkSession()) {
        window.location.href = "https://woo-2003.github.io/WEB_MAIN_20221022/login/index_login.html";
        return;
    }

    // 로그인 실패 알림
    const failCount = parseInt(localStorage.getItem('login_fail_count') || '0');
    if (failCount > 0) {
        alert(`이전 로그인 시도 중 ${failCount}회 실패했습니다.`);
    }

    // 아이디 저장 체크박스 상태 복원
    const idSaveCheck = document.getElementById('idSaveCheck');
    if (idSaveCheck) {
        idSaveCheck.checked = localStorage.getItem('idSaveCheck') === 'true';
        if (idSaveCheck.checked) {
            const savedId = localStorage.getItem('savedId');
            if (savedId) {
                const emailInput = document.getElementById('typeEmailX');
                if (emailInput) {
                    emailInput.value = savedId;
                }
            }
        }
    }
}

// XSS 방지 함수
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}

// 쿠키 설정
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// 쿠키 가져오기
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 입력값 검증
export async function check_input() {
    // 로그인 차단 확인
    if (check_login_block()) {
        return false;
    }

    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const idSaveCheck = document.getElementById('idSaveCheck');

    if (!emailInput || !passwordInput) {
        alert('입력 필드를 찾을 수 없습니다.');
        return false;
    }

    // 입력값 가져오기 및 XSS 방지
    const email = sanitizeInput(emailInput.value.trim());
    const password = sanitizeInput(passwordInput.value.trim());

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        login_failed();
        return false;
    }

    // 비밀번호 검증
    if (password.length < 6) {
        alert('비밀번호는 최소 6자 이상이어야 합니다.');
        login_failed();
        return false;
    }

    try {
        // JWT 토큰 생성
        const token = generateToken({ email });
        
        // 세션 데이터 암호화
        const sessionData = {
            email,
            token,
            loginTime: Date.now()
        };
        
        const encryptedData = encryptSessionData(JSON.stringify(sessionData));
        setSessionData(encryptedData);
        
        // 아이디 저장 처리
        if (idSaveCheck && idSaveCheck.checked) {
            localStorage.setItem('idSaveCheck', 'true');
            localStorage.setItem('savedId', email);
        } else {
            localStorage.removeItem('idSaveCheck');
            localStorage.removeItem('savedId');
        }

        // 로그인 성공 처리
        count_login();
        reset_login_fail_count();
        
        // 로그인 성공 후 리다이렉트
        window.location.href = "https://woo-2003.github.io/WEB_MAIN_20221022/login/index_login.html";
        return true;
        
    } catch (error) {
        console.error('Login error:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        login_failed();
        return false;
    }
}

// DOM이 준비되면 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}




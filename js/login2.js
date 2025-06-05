import { startSession, checkSession, handleSessionExpiration, setSessionData, getSessionData, encryptSessionData, decryptSessionData, deleteSession } from './session.js';
import { encryptText, decryptText } from './js_crypto.js';
import { generateToken, verifyToken } from './js_jwt_token.js';

// window.checkAuth = checkAuth;

function init() {
    const emailInput = document.getElementById('typeEmailX');
    const idSaveCheck = document.getElementById('idSaveCheck');
    const savedId = localStorage.getItem('savedId');

    if (savedId) {
        emailInput.value = savedId;
        idSaveCheck.checked = true;
    }

    // 세션 상태 확인
    if (checkSession()) {
        window.location.href = "https://woo-2003.github.io/WEB_MAIN_20221022/login/index_login.html";
    }
}

// DOM이 로드된 후에만 실행
document.addEventListener('DOMContentLoaded', () => {
    // 현재 페이지가 index_login.html인 경우에만 init_logined 실행
    if (window.location.pathname.includes('index_login.html')) {
        init_logined();
    } else {
        init();
    }
});

const check_xss = (input) => {
    const DOMPurify = window.DOMPurify;
    const sanitizedInput = DOMPurify.sanitize(input);
    if (sanitizedInput !== input) {
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    return sanitizedInput;
};

function setCookie(name, value, expiredays) {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = escape(name) + "=" + escape(value) + ";expires=" + date.toUTCString() + "; path=/";
}

function getCookie(name) {
    var cookie = document.cookie;
    if (cookie != "") {
        var cookie_array = cookie.split("; ");
        for (var index in cookie_array) {
            var cookie_name = cookie_array[index].split("=");
            if (cookie_name[0] == name) {
                return cookie_name[1];
            }
        }
    }
    return null;
}

const check_input = async () => {
    const loginForm = document.getElementById('login_form');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');
    const idsave_check = document.getElementById('idSaveCheck');

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();

    const sanitizedPassword = check_xss(passwordValue);
    const sanitizedEmail = check_xss(emailValue);

    if (!sanitizedEmail || !sanitizedPassword) {
        return false;
    }

    if (emailValue === '') {
        alert('이메일을 입력하세요.');
        return false;
    }

    if (passwordValue === '') {
        alert('비밀번호를 입력하세요.');
        return false;
    }

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

    // 아이디 저장 처리
    if (idsave_check.checked) {
        setCookie("id", emailValue, 1);
    } else {
        setCookie("id", "", 0);
    }

    // JWT 토큰 생성
    const payload = {
        id: emailValue,
        exp: Math.floor(Date.now() / 1000) + 3600
    };
    const jwtToken = generateToken(payload);

    // 세션 시작
    startSession();
    setSessionData('user', { email: emailValue });
    localStorage.setItem('jwt_token', jwtToken);

    // 로그인 성공 시 리다이렉트
    window.location.href = "https://woo-2003.github.io/WEB_MAIN_20221022/login/index_login.html";
    return false;
};

export function init_logined() {
    if (!checkSession()) {
        alert('로그인이 필요합니다.');
        window.location.href = "https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html";
        return;
    }

    try {
        const sessionData = getSessionData('user');
        if (sessionData) {
            const decryptedData = decryptText(sessionData);
            console.log('복호화된 세션 데이터:', decryptedData);
        }
    } catch (error) {
        console.error('세션 데이터 처리 중 오류:', error);
        deleteSession();
        window.location.href = "https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html";
    }
}

export { init, check_input };


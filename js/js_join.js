import { session_set2, session_get_join } from './session.js';
import { encrypt_text, decrypt_text } from './js_crypto.js';
import { generateJWT } from './js_jwt_token.js';

// 정규식 패턴 정의
const PATTERNS = {
    name: /^[가-힣]{2,10}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/
};

// 에러 메시지 정의
const ERROR_MESSAGES = {
    name: "이름은 2~10자의 한글만 입력 가능합니다.",
    email: "올바른 이메일 형식이 아닙니다.",
    password: "비밀번호는 8~20자이며 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.",
    passwordMatch: "비밀번호가 일치하지 않습니다.",
    agreement: "약관에 동의하셔야 가입이 가능합니다.",
    emailDuplicate: "이미 사용 중인 이메일입니다.",
    saveError: "회원가입 정보 저장 중 오류가 발생했습니다."
};

class SignUp {
    constructor(name, email, password) {
        this._name = name;
        this._email = email;
        this._password = this._encryptPassword(password);
        this._createdAt = new Date().toISOString();
    }

    _encryptPassword(password) {
        return CryptoJS.SHA256(password).toString();
    }

    getUserInfo() {
        return {
            name: this._name,
            email: this._email,
            password: this._password,
            createdAt: this._createdAt
        };
    }
}

// XSS 방지 함수
const sanitizeInput = (input) => {
    if (!input) return '';
    const DOMPurify = window.DOMPurify;
    if (!DOMPurify) {
        console.error('DOMPurify가 로드되지 않았습니다.');
        return input;
    }
    return DOMPurify.sanitize(input);
};

// 입력값 검증 함수
const validateInput = (name, email, password, rePassword) => {
    if (!PATTERNS.name.test(name)) {
        alert(ERROR_MESSAGES.name);
        return false;
    }

    if (!PATTERNS.email.test(email)) {
        alert(ERROR_MESSAGES.email);
        return false;
    }

    if (!PATTERNS.password.test(password)) {
        alert(ERROR_MESSAGES.password);
        return false;
    }

    if (password !== rePassword) {
        alert(ERROR_MESSAGES.passwordMatch);
        return false;
    }

    return true;
};

// 이메일 중복 체크 함수
const checkEmailDuplicate = async (email) => {
    try {
        const existingUsers = await session_get_join();
        if (existingUsers && existingUsers.some(user => user.email === email)) {
            alert(ERROR_MESSAGES.emailDuplicate);
            return true;
        }
        return false;
    } catch (error) {
        console.error('이메일 중복 체크 중 오류:', error);
        return false;
    }
};

// 회원가입 처리 함수
async function join() {
    try {
        const form = document.querySelector("#join_form");
        const name = sanitizeInput(document.querySelector("#form3Example1c").value);
        const email = sanitizeInput(document.querySelector("#form3Example3c").value);
        const password = document.querySelector("#form3Example4c").value;
        const rePassword = document.querySelector("#form3Example4cd").value;
        const agree = document.querySelector("#form2Example3c").checked;

        // 입력값 검증
        if (!validateInput(name, email, password, rePassword)) {
            return;
        }

        // 약관 동의 확인
        if (!agree) {
            alert(ERROR_MESSAGES.agreement);
            return;
        }

        // 이메일 중복 체크
        if (await checkEmailDuplicate(email)) {
            return;
        }

        // 회원가입 정보 객체 생성
        const newSignUp = new SignUp(name, email, password);
        
        // 회원가입 정보 저장
        const saveResult = await session_set2(newSignUp);
        if (!saveResult) {
            alert(ERROR_MESSAGES.saveError);
            return;
        }

        // JWT 토큰 생성 및 저장
        const payload = {
            email: email,
            name: name,
            exp: Math.floor(Date.now() / 1000) + 3600 // 1시간
        };
        
        const jwtToken = await generateJWT(payload);
        localStorage.setItem('jwt_token', jwtToken);

        // 회원가입 성공 메시지
        alert('회원가입이 완료되었습니다. 자동으로 로그인됩니다.');
        
        // 메인 페이지로 리다이렉트
        window.location.href = "https://woo-2003.github.io/WEB_MAIN_20221022/login/index_login.html";
        
    } catch (error) {
        console.error('회원가입 처리 중 오류:', error);
        alert('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 회원가입 정보 초기화 함수
async function init_join_info() {
    try {
        const userData = await session_get_join();
        if (userData) {
            console.log('회원가입 정보:', userData);
        }
    } catch (error) {
        console.error('회원가입 정보 초기화 중 오류:', error);
    }
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    const joinBtn = document.getElementById("join_btn");
    if (joinBtn) {
        joinBtn.addEventListener('click', join);
    }
    init_join_info();
});
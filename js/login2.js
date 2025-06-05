import { startSession, checkSession, deleteSession } from './session.js';
import { encryptText, decryptText } from './js_crypto.js';
import { generateToken } from './js_jwt_token.js';

// 정규식 패턴
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/
};

// 에러 메시지
const ERROR_MESSAGES = {
  email: '올바른 이메일 형식이 아닙니다.',
  password: '비밀번호는 8~20자이며 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.',
  login: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.',
  session: '세션 생성에 실패했습니다. 다시 시도해주세요.'
};

// XSS 방지
function sanitizeInput(input) {
  if (!input) return '';
  const DOMPurify = window.DOMPurify;
  if (!DOMPurify) {
    console.error('DOMPurify가 로드되지 않았습니다.');
    return input;
  }
  return DOMPurify.sanitize(input);
}

// 입력값 검증
function validateInput(email, password) {
  if (!PATTERNS.email.test(email)) {
    alert(ERROR_MESSAGES.email);
    return false;
  }
  
  if (!PATTERNS.password.test(password)) {
    alert(ERROR_MESSAGES.password);
    return false;
  }
  
  return true;
}

// 쿠키 설정
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

// 쿠키 가져오기
function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// 로그인 처리
export async function check_input() {
  try {
    const email = sanitizeInput(document.querySelector('#typeEmailX').value);
    const password = document.querySelector('#typePasswordX').value;
    const saveId = document.querySelector('#idSaveCheck').checked;
    
    if (!validateInput(email, password)) {
      return;
    }
    
    // 아이디 저장
    if (saveId) {
      setCookie('saved_email', email, 7);
    } else {
      setCookie('saved_email', '', 0);
    }
    
    // 로그인 처리
    const userData = {
      email: email,
      password: password,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    // 세션 시작
    const sessionResult = await startSession(userData);
    if (!sessionResult) {
      alert(ERROR_MESSAGES.session);
      return;
    }
    
    // 로그인 성공 시 메인 페이지로 이동
    window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/index_login.html';
    
  } catch (error) {
    console.error('로그인 처리 중 오류:', error);
    alert(ERROR_MESSAGES.login);
  }
}

// 로그인 상태 초기화
export async function init_logined() {
  try {
    if (!checkSession()) {
      return;
    }
    
    const savedEmail = getCookie('saved_email');
    if (savedEmail) {
      const emailInput = document.querySelector('#typeEmailX');
      if (emailInput) {
        emailInput.value = savedEmail;
        document.querySelector('#idSaveCheck').checked = true;
      }
    }
  } catch (error) {
    console.error('로그인 상태 초기화 중 오류:', error);
  }
}

// 초기화
export function init() {
  try {
    if (checkSession()) {
      window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/index_login.html';
      return;
    }
    
    init_logined();
  } catch (error) {
    console.error('초기화 중 오류:', error);
  }
}


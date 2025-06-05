import { encryptText, decryptText } from './js_crypto.js';
import { generateToken, verifyToken } from './js_jwt_token.js';

// 세션 만료 시간 (30분)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// 세션 시작
export async function startSession(userData) {
  try {
    if (!userData) {
      throw new Error('사용자 데이터가 없습니다.');
    }

    const sessionData = {
      user: userData,
      startTime: Date.now(),
      lastActivity: Date.now()
    };

    const encryptedData = await encryptText(JSON.stringify(sessionData));
    sessionStorage.setItem('session_data', encryptedData);

    // JWT 토큰 생성
    const token = await generateToken({
      email: userData.email,
      exp: Math.floor(Date.now() / 1000) + 1800 // 30분
    });

    localStorage.setItem('jwt_token', token);
    return true;
  } catch (error) {
    console.error('세션 시작 중 오류:', error);
    return false;
  }
}

// 세션 만료 체크
export function checkSessionExpired() {
  try {
    const sessionData = sessionStorage.getItem('session_data');
    if (!sessionData) return true;

    const lastActivity = JSON.parse(decryptText(sessionData)).lastActivity;
    return Date.now() - lastActivity > SESSION_TIMEOUT;
  } catch (error) {
    console.error('세션 만료 체크 중 오류:', error);
    return true;
  }
}

// 세션 만료 처리
export function handleSessionExpiration() {
  deleteSession();
  window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
}

// 세션 데이터 저장
export async function setSessionData(key, value) {
  try {
    if (!sessionStorage) {
      throw new Error('세션 스토리지를 사용할 수 없습니다.');
    }

    const sessionData = {
      [key]: value,
      lastActivity: Date.now()
    };

    const encryptedData = await encryptText(JSON.stringify(sessionData));
    sessionStorage.setItem('session_data', encryptedData);
    return true;
  } catch (error) {
    console.error('세션 데이터 저장 중 오류:', error);
    return false;
  }
}

// 세션 데이터 조회
export async function getSessionData(key) {
  try {
    if (!sessionStorage) {
      throw new Error('세션 스토리지를 사용할 수 없습니다.');
    }

    const sessionData = sessionStorage.getItem('session_data');
    if (!sessionData) return null;

    const decryptedData = await decryptText(sessionData);
    const data = JSON.parse(decryptedData);

    if (checkSessionExpired()) {
      handleSessionExpiration();
      return null;
    }

    return key ? data[key] : data;
  } catch (error) {
    console.error('세션 데이터 조회 중 오류:', error);
    return null;
  }
}

// 세션 삭제
export function deleteSession() {
  try {
    sessionStorage.removeItem('session_data');
    localStorage.removeItem('jwt_token');
    return true;
  } catch (error) {
    console.error('세션 삭제 중 오류:', error);
    return false;
  }
}

// 인증 상태 확인
export async function checkAuth() {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
      return false;
    }

    const isValid = await verifyToken(token);
    if (!isValid) {
      deleteSession();
      window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
      return false;
    }

    return true;
  } catch (error) {
    console.error('인증 상태 확인 중 오류:', error);
    deleteSession();
    window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
    return false;
  }
}

// 회원가입 데이터 저장
export async function session_set2(userData) {
  try {
    const users = await getSessionData('users') || [];
    users.push(userData);
    return await setSessionData('users', users);
  } catch (error) {
    console.error('회원가입 데이터 저장 중 오류:', error);
    return false;
  }
}

// 회원가입 데이터 조회
export async function session_get_join() {
  try {
    return await getSessionData('users') || [];
  } catch (error) {
    console.error('회원가입 데이터 조회 중 오류:', error);
    return [];
  }
}

// 세션 체크
export function checkSession() {
    if (checkSessionExpired()) {
        handleSessionExpiration();
        return false;
    }
    return true;
}

// 페이지 로드 시 세션 체크 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        startSession();
        setInterval(checkSession, 60000); // 1분마다 체크
    });
} else {
    startSession();
    setInterval(checkSession, 60000);
}

export function session_set() { //세션 저장
    let id = document.querySelector("#typeEmailX");
    let password = document.querySelector("#typePasswordX");
    let random = new Date(); // 랜덤 타임스탬프

    const obj = { // 객체 선언
        id: id.value,
        otp: random,
        expires: new Date().getTime() + SESSION_TIMEOUT // 만료 시간 추가
    }

    if (sessionStorage) {
        const objString = JSON.stringify(obj); // 객체 -> JSON 문자열 변환
        let en_text = encryptText(objString); // 암호화

        sessionStorage.setItem("Session_Storage_id", id.value);
        sessionStorage.setItem("Session_Storage_object", objString);
        sessionStorage.setItem("Session_Storage_pass", en_text);
        
        // 세션 ID를 쿠키로도 저장 (1일)
        setCookie("session_id", id.value, 1);
        
        // 자동 로그아웃 타이머 설정
        setTimeout(() => {
            if (sessionStorage.getItem("Session_Storage_id")) {
                alert("세션이 만료되어 자동 로그아웃됩니다.");
                session_del();
                location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
            }
        }, SESSION_TIMEOUT);
    } else {
        alert("세션 스토리지 지원 x");
    }
}

export function session_get() { //세션 읽기
    if (sessionStorage) {
        return sessionStorage.getItem("Session_Storage_pass");
    } else {
        alert("세션 스토리지 지원 x");
        return null;
    }
}

export function session_check() { //세션 검사
    if (sessionStorage.getItem("Session_Storage_id")) {
        const sessionData = JSON.parse(sessionStorage.getItem("Session_Storage_object"));
        const currentTime = new Date().getTime();
        
        // 세션 만료 시간 체크
        if (sessionData.expires && currentTime > sessionData.expires) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            session_del();
            location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
            return;
        }
        
        alert("이미 로그인 되었습니다.");
        location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/index_login.html'; // 로그인된 페이지로 이동
    }
}

function session_del() {//세션 삭제
    if (sessionStorage) {
        sessionStorage.removeItem("Session_Storage_id");
        sessionStorage.removeItem("Session_Storage_object");
        sessionStorage.removeItem("Session_Storage_pass");
        setCookie("session_id", "", 0); // 세션 ID 쿠키 삭제
        alert('로그아웃 버튼 클릭 확인 : 세션 스토리지를 삭제합니다.');
    } else {
        alert("세션 스토리지 지원 x");
    }
}
  
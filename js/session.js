import { encryptText, decryptText } from './js_crypto.js';
import { verifyToken } from './js_jwt_token.js';

// 세션 만료 시간 설정 (30분)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// 세션 시작
export function startSession() {
    sessionStorage.setItem('sessionStartTime', Date.now().toString());
}

// 세션 만료 체크
export function checkSessionExpired() {
    const sessionStartTime = sessionStorage.getItem('sessionStartTime');
    if (!sessionStartTime) {
        return true;
    }

    const currentTime = Date.now();
    const sessionTime = currentTime - parseInt(sessionStartTime);
    
    return sessionTime > SESSION_TIMEOUT;
}

// 세션 만료 시 처리
export function handleSessionExpiration() {
    alert('세션이 만료되어 자동 로그아웃됩니다.');
    sessionStorage.clear();
    localStorage.removeItem('jwt_token');
    location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
}

// 세션 체크
export function checkSession() {
    if (checkSessionExpired()) {
        handleSessionExpiration();
        return false;
    }
    return true;
}

// 세션 데이터 설정
export async function setSessionData(data) {
    if (sessionStorage) {
        const encryptedData = await encryptText(data);
        sessionStorage.setItem('sessionData', encryptedData);
        startSession();
    } else {
        alert('세션 스토리지를 지원하지 않는 브라우저입니다.');
    }
}

// 세션 데이터 가져오기
export async function getSessionData() {
    if (sessionStorage) {
        const encryptedData = sessionStorage.getItem('sessionData');
        if (encryptedData) {
            return await decryptText(encryptedData);
        }
    }
    return null;
}

// 세션 데이터 암호화
export async function encryptSessionData(data) {
    return await encryptText(data);
}

// 세션 데이터 복호화
export async function decryptSessionData(data) {
    return await decryptText(data);
}

// 세션 삭제
export function deleteSession() {
    if (sessionStorage) {
        sessionStorage.clear();
        localStorage.removeItem('jwt_token');
        setCookie('session_id', '', 0);
    }
}

// 쿠키 설정
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
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

// 인증 체크 함수
export async function checkAuth() {
    try {
        // JWT 토큰 확인
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
            return false;
        }

        // 토큰 검증
        const payload = await verifyToken(token);
        if (!payload) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            localStorage.removeItem('jwt_token');
            window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
            return false;
        }

        // 세션 상태 확인
        if (!checkSession()) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('인증 체크 중 오류:', error);
        alert('인증 처리 중 오류가 발생했습니다.');
        window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
        return false;
    }
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

export function session_set2(obj){ //세션 저장(객체)
    if (sessionStorage) {
        const objString = JSON.stringify(obj); // 객체 -> JSON 문자열 변환
        let en_text = encryptText(objString); // 암호화
        sessionStorage.setItem("Session_Storage_join", objString);
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

export function session_get_join() { //세션 읽기(회원가입)
    if (sessionStorage) {
        const joinData = sessionStorage.getItem("Session_Storage_join");
        if (joinData) {
            return JSON.parse(joinData);
        }
        return null;
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
  
import { encrypt_text, decrypt_text } from './js_crypto.js';

// 세션 만료 시간 설정 (30분)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분을 밀리초로 변환

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
        let en_text = encrypt_text(objString); // 암호화

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
        let en_text = encrypt_text(objString); // 암호화
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

export function checkAuth() {
    if (!sessionStorage.getItem("Session_Storage_id")) {
        alert("로그인이 필요합니다.");
        location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
        return;
    }
    
    const sessionData = JSON.parse(sessionStorage.getItem("Session_Storage_object"));
    const currentTime = new Date().getTime();
    
    // 세션 만료 시간 체크
    if (sessionData.expires && currentTime > sessionData.expires) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        session_del();
        location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
        return;
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

// 쿠키 설정 함수
function setCookie(name, value, expiredays) {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = escape(name) + "=" + escape(value) + "; expires=" + date.toUTCString() + "; path=/";
}
  
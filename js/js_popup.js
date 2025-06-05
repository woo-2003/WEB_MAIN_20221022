// 상수 정의
const CLOSE_DELAY = 50; // 50초
const COOKIE_EXPIRY = 1; // 1일

// 팝업 창 열기
export function pop_up() {
  const cookieCheck = CookieManager.getCookie("popupYN");
  if (cookieCheck !== "N") {
    const popup = window.open(
      "https://woo-2003.github.io/WEB_MAIN_20221022/popup/popup.html",
      "팝업테스트",
      "width=400, height=500, top=10, left=10"
    );
    
    if (popup) {
      popup.focus();
    }
  }
}

// (../)의 뜻 = 한 파일 밖에 나가서 불러온다

// 타이머 관련 변수
let close_time;
let close_time2 = CLOSE_DELAY;

// 쿠키 관리
const CookieManager = {
  setCookie(name, value, expiredays) {
    try {
      const date = new Date();
      date.setDate(date.getDate() + expiredays);
      const cookieValue = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
      document.cookie = cookieValue;
      console.log("쿠키가 설정되었습니다:", cookieValue);
      return true;
    } catch (error) {
      console.error("쿠키 설정 중 오류:", error);
      return false;
    }
  },

  getCookie(name) {
    try {
      const cookie = document.cookie;
      if (!cookie) return null;
      
      const cookieArray = cookie.split("; ");
      for (const cookieItem of cookieArray) {
        const [cookieName, cookieValue] = cookieItem.split("=");
        if (cookieName === name) {
          return decodeURIComponent(cookieValue);
        }
      }
      return null;
    } catch (error) {
      console.error("쿠키 읽기 중 오류:", error);
      return null;
    }
  }
};

// 타이머 관리
const TimerManager = {
  initTimer() {
    clearTimeout(close_time);
    close_time = setTimeout(() => {
      window.close();
    }, CLOSE_DELAY * 1000);
  },

  show_time() {
    const divClock = document.getElementById('Time');
    if (!divClock) return;

    divClock.innerText = `자동 닫힘까지 ${close_time2}초`;
    close_time2--;
    
    if (close_time2 >= 0) {
      setTimeout(() => TimerManager.show_time(), 1000);
    }
  }
};

// 타이머 표시
export function show_time() {
  TimerManager.show_time();
}

// 페이지 로드 시 타이머 초기화
if (window.location.pathname.includes('popup.html')) {
  TimerManager.initTimer();
}

// 팝업 창 닫기
function close_window() {
  window.close();
}

// 시계 표시
export function show_clock() {
  const divClock = document.getElementById('divClock');
  if (!divClock) return;

  function updateClock() {
    const currentDate = new Date();
    let msg = "현재 시간 : ";
    
    const hours = currentDate.getHours();
    msg += hours > 12 ? "오후 " + (hours - 12) : "오전 " + hours;
    msg += "시 " + currentDate.getMinutes() + "분 " + currentDate.getSeconds() + "초";
    
    divClock.innerText = msg;
    
    // 정각 1분 전 빨간색 표시
    divClock.style.color = currentDate.getMinutes() > 58 ? "red" : "black";
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// 이미지 호버 효과
export function over(obj) {
  obj.src = "https://woo-2003.github.io/WEB_MAIN_20221022/image/lollogo.png";
}

export function out(obj) {
  obj.src = "https://woo-2003.github.io/WEB_MAIN_20221022/image/popuplollogo.png";
}

// 팝업 닫기 및 쿠키 설정
export function closePopup() {
  const checkbox = document.getElementById('check_popup');
  if (checkbox?.checked) {
    if (CookieManager.setCookie("popupYN", "N", COOKIE_EXPIRY)) {
      console.log("팝업을 닫고 쿠키를 설정합니다.");
      window.close();
    }
  }
}
  
// const over = (obj) => {
//   obj.src = "image/LOGO.png";
// };
// const search_message = () => {
// const c = '검색을 수행합니다';
// alert(c);
// };





// const over = (obj) => {
//   obj.src = "image/LOGO.png";
//   };

window.pop_up = function() {
  var cookieCheck = getCookie("popupYN");
    if (cookieCheck != "N"){
    window.open("popup/popup.html", "팝업테스트", "width=400, height=300, top=10, left=10");
  }
}

  // (../)의 뜻 = 한 파일 밖에 나가서 불러온다

var close_time; // 시간 정보
var close_time2 = 50; // 10초 설정

clearTimeout(close_time); // 재호출 정지
close_time = setTimeout("close_window()", 50000);

// show_time 함수를 window 객체에 할당
window.show_time = function() {
  let divClock = document.getElementById('Time');
  if (divClock) {  // Time 요소가 존재하는 경우에만 실행
    divClock.innerText = close_time2; // 10초 삽입 시작
    close_time2--; // 1초씩 감소
    setTimeout(show_time, 1000); //1초마다 갱신
  }
}

// 페이지 로드 시 show_time 함수 실행
if (window.location.pathname.includes('popup.html')) {
  show_time();
}

function close_window() { // 함수 정의
  window.close(); // 윈도우 닫기
}

function setCookie(name, value, expiredays) {
  var date = new Date();
  date.setDate(date.getDate() + expiredays);
  document.cookie = escape(name) + "=" + escape(value) + "; expires=" + date.toUTCString() + "; path=/; SameSite=None; Secure";
}

function getCookie(name) {
  var cookie = document.cookie;
  console.log("쿠키를 요청합니다.");
  if (cookie != "") {
      var cookie_array = cookie.split("; ");
      for ( var index in cookie_array) {
        var cookie_name = cookie_array[index].split("=");
        if (cookie_name[0] == "popupYN") {
          return cookie_name[1];
        }
      }
  } 
  return ;
}


function show_clock(){
  let currentDate = new Date(); // 현재 시스템 날짜 객체 생성
  let divClock = document.getElementById('divClock');
  let msg = "현재 시간 : ";
  if(currentDate.getHours()>12){ // 12시 보다 크면 오후 아니면 오전
  msg += "오후";
  msg += currentDate.getHours()-12+"시";
  }
  else {
  msg += "오전";
  msg += currentDate.getHours()+"시";
  }
  msg += currentDate.getMinutes()+"분";
  msg += currentDate.getSeconds()+"초";
  divClock.innerText = msg;
  if (currentDate.getMinutes()>58) { //정각 1분전 빨강색 출력
  divClock.style.color="red";
  }
  setTimeout(show_clock, 1000); //1초마다 갱신
}

function over(obj) {
  obj.src = "image/lollogo.png";
}
function out(obj) {
  obj.src = "image/popuplollogo.png";
}


function closePopup() {
  if (document.getElementById('check_popup').value) {
    setCookie("popupYN", "N", 1);
    console.log("쿠키를 설정합니다.");
    self.close();
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

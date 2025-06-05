import { session_set2, session_get_join } from './session.js';

async function join(){ // 회원가입 기능
  let form = document.querySelector("#join_form"); // 로그인 폼 식별자
  let name = document.querySelector("#form3Example1c");
  let email = document.querySelector("#form3Example3c");
  let password = document.querySelector("#form3Example4c");
  let re_password = document.querySelector("#form3Example4cd");
  let agree = document.querySelector("#form2Example3c");

  // 정규식 패턴 정의
  const nameRegex = /^[가-힣]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  form.action = "https://woo-2003.github.io/WEB_MAIN_20221022/index.html"; // 로그인 성공 시 이동
  form.method = "get"; // 전송 방식

  // 이름 검사
  if (!nameRegex.test(name.value)) {
    alert("이름은 한글만 입력 가능합니다.");
    name.focus();
    return;
  }

  // 이메일 검사
  if (!emailRegex.test(email.value)) {
    alert("이메일 형식이 올바르지 않습니다.");
    email.focus();
    return;
  }

  // 비밀번호 검사
  if (!pwRegex.test(password.value)) {
    alert("비밀번호는 8자 이상이며 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.");
    password.focus();
    return;
  }

  // 비밀번호 일치 검사
  if (password.value !== re_password.value) {
    alert("비밀번호가 일치하지 않습니다.");
    re_password.focus();
    return;
  }

  // 약관 동의 확인
  if (!agree.checked) {
    alert("약관에 동의하셔야 가입이 가능합니다.");
    return;
  }

  // 모든 검증을 통과한 경우
  const newSignUp = new SignUp(name.value, email.value, password.value, re_password.value); // 회원가입 정보 객체 생성
  
  // 회원가입 정보 암호화하여 저장
  const saveResult = await session_set2(newSignUp);
  if (!saveResult) {
    alert("회원가입 정보 저장 중 오류가 발생했습니다.");
    return;
  }

  form.submit(); // 폼 실행
}

// 로그인 후 회원가입 정보 복호화 및 출력
async function init_join_info() {
  const userData = await session_get_join();
  if (userData) {
    console.log('회원가입 정보:', userData);
  }
}

class SignUp {
  constructor(name, email, password, re_password) {
    // 생성자 함수: 객체 생성 시 회원 정보 초기화
    this._name = name;
    this._email = email;
    this._password = password;
    this._re_password = re_password;
  }
  setUserInfo(name, email, password, re_password) {
    this._name = name;
    this._email = email;
    this._password = password;
    this._re_password = re_password;
  }
  // 전체 회원 정보를 한 번에 가져오는 함수
  getUserInfo() {
    return {
      name: this._name,
      email: this._email,
      password: this._password,
      re_password: this._re_password
    };
  }
}

// 이벤트 리스너 등록
document.getElementById("join_btn").addEventListener('click', join);

// 페이지 로드 시 회원가입 정보 확인
document.addEventListener('DOMContentLoaded', init_join_info);
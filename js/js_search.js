// 검색 버튼 이벤트 연결 (id를 search_button_msg로 변경)
document.getElementById("search_button_msg").addEventListener('click', search_message);

function search_message() {
  const searchTerm = document.getElementById("search_input").value;
  
  // 공백 검사
  if (!searchTerm.trim()) {
    alert("검색어를 입력해주세요.");
    return false;
  }
  
  // 비속어 검사
  const badWords = ["시발", "병신", "비속어", "욕", "심한말"];
  if (badWords.some(word => searchTerm.toLowerCase().includes(word.toLowerCase()))) {
    alert("비속어가 포함되어 있어 검색할 수 없습니다.");
    return false;
  }
  
  // 검색 실행
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
  window.open(googleSearchUrl, "_blank");
  return false;
}

// 폼 제출 이벤트 처리
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('form[role="search"]');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      return search_message();
    });
  }
});

// 두 번째 search_message 함수 (중첩 테스트)
function search_message(){
  let msg = "검색을 수행합니다 - 중첩으로 인한 두번째 함수";
  alert(msg);
}

// function googleSearch() {
//   const searchTerm = document.getElementById("search_input").value; // 검색어로 설정
//   const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
//   // 새 창에서 구글 검색을 수행
//   window.open(googleSearchUrl, "_blank"); // 새로운 창에서 열기.
//   return false;
//   }

function googleSearch() {
  const searchTerm = document.getElementById("search_input").value;
  // 공백 검사
  if (searchTerm.trim().length === 0) {
    alert("검색어를 입력해주세요.");
    return false;
  }
  // 비속어 검사
  const badWords = ["시발", "병신", "비속어", "욕", "심한말"];
  for (let i = 0; i < badWords.length; i++) {
    if (searchTerm.toLowerCase().includes(badWords[i].toLowerCase())) {
      alert("비속어가 포함되어 있어 검색할 수 없습니다.");
      return false;
    }
  }
  // 검색 실행
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
  window.open(googleSearchUrl, "_blank");
  return false;
}
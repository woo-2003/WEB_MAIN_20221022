// 검색 기능 초기화
export function initSearch() {
  const searchButton = document.getElementById("search_btn");
  const searchForm = document.querySelector('form[role="search"]');
  
  if (searchButton) {
    searchButton.addEventListener('click', search_message);
  }
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      return search_message();
    });
  }
}

// 검색 메시지 처리
export function search_message() {
  const searchInput = document.getElementById("search_input");
  if (!searchInput) return false;
  
  const searchTerm = searchInput.value;
  
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

// DOM이 로드된 후 검색 기능 초기화
document.addEventListener('DOMContentLoaded', initSearch);
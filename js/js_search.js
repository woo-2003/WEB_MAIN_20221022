// 검색 기능 초기화
export function initSearch() {
  const searchButton = document.getElementById("search_btn");
  const searchForm = document.querySelector('form[role="search"]');
  const searchInput = document.getElementById("search_input");
  
  if (searchButton) {
    searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      search_message();
    });
  }
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      search_message();
    });
  }

  // 엔터 키 이벤트 처리
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        search_message();
      }
    });
  }
}

// 검색어 유효성 검사
function validateSearchTerm(term) {
  // 공백 검사
  if (!term.trim()) {
    alert("검색어를 입력해주세요.");
    return false;
  }
  
  // 최소 길이 검사
  if (term.trim().length < 2) {
    alert("검색어는 최소 2글자 이상이어야 합니다.");
    return false;
  }
  
  // 비속어 검사
  const badWords = ["시발", "병신", "비속어", "욕", "심한말"];
  if (badWords.some(word => term.toLowerCase().includes(word.toLowerCase()))) {
    alert("비속어가 포함되어 있어 검색할 수 없습니다.");
    return false;
  }
  
  return true;
}

// 검색 메시지 처리
export function search_message() {
  const searchInput = document.getElementById("search_input");
  if (!searchInput) return false;
  
  const searchTerm = searchInput.value;
  
  // 검색어 유효성 검사
  if (!validateSearchTerm(searchTerm)) {
    return false;
  }
  
  try {
    // 검색 실행
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    
    // 검색창 열기 전에 입력창 초기화
    searchInput.value = '';
    
    // 새 창에서 검색 결과 열기
    const searchWindow = window.open(googleSearchUrl, "_blank");
    
    // 창이 차단되었는지 확인
    if (!searchWindow || searchWindow.closed || typeof searchWindow.closed === 'undefined') {
      alert("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
    }
    
    return false;
  } catch (error) {
    console.error("검색 중 오류가 발생했습니다:", error);
    alert("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
    return false;
  }
}

// DOM이 로드된 후 검색 기능 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}
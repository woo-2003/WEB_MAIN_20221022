// 금지어 목록
const PROHIBITED_WORDS = ['비속어', '욕설', '광고'];

// 검색 기능 초기화
export function initSearch() {
  const searchBtn = document.getElementById('search_btn');
  const searchInput = document.getElementById('search_input');
  
  if (searchBtn && searchInput) {
    // 검색 버튼 클릭 이벤트
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      search_message();
    });
    
    // 엔터 키 이벤트
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
  if (!term) {
    alert('검색어를 입력해주세요.');
    return false;
  }
  
  if (term.length < 2) {
    alert('검색어는 2글자 이상이어야 합니다.');
    return false;
  }
  
  // 금지어 체크
  for (const word of PROHIBITED_WORDS) {
    if (term.includes(word)) {
      alert('부적절한 검색어가 포함되어 있습니다.');
      return false;
    }
  }
  
  return true;
}

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

// 검색 실행
export function search_message() {
  const searchInput = document.getElementById('search_input');
  if (!searchInput) return false;
  
  const searchTerm = sanitizeInput(searchInput.value.trim());
  
  if (!validateSearchTerm(searchTerm)) {
    return false;
  }
  
  try {
    // Google 검색 URL 생성
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;
    
    // 새 창에서 검색 결과 열기
    window.open(searchUrl, '_blank');
    
    // 검색어 초기화
    searchInput.value = '';
    
    return true;
  } catch (error) {
    console.error('검색 중 오류 발생:', error);
    alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    return false;
  }
}

// DOM이 로드된 후 검색 기능 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}
document.getElementById("search_btn").addEventListener('click', search_message);

function search_message(){
alert("검색을 수행합니다!");
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
    const badWords = ["비속어1", "비속어2", "비속어3", "비속어4", "비속어5"];
    
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
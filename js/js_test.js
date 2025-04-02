var jb = 'ht';
var a = 1;
var b;
b = 5;
c = 10;

// 일반 변수 = let
// 상수 = const

if (true) {
  let c = 'let 접근'; // 일반 변수
  var c_1 = 'var 접근';
  }
  //console.log(c); // Error?
  console.log(c_1);
  let d = 5;
  //let d = '값 재할당'; // Error?
  console.log(d);
  const e = '상수1 접근'; // 상수수
  //e = 5;
  //const f // Error?
  console.log(e);
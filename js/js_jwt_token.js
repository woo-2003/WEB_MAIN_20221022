// JWT 시크릿 키
const SECRET_KEY = 'your-secret-key';

// HMAC-SHA256 서명 생성
async function createSignature(data, key) {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(data);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageData
    );
    
    return btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
  } catch (error) {
    console.error('서명 생성 중 오류:', error);
    throw new Error('서명 생성 실패');
  }
}

// JWT 토큰 생성
export async function generateToken(payload) {
  try {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp || now + 3600; // 기본 1시간
    
    const finalPayload = {
      ...payload,
      iat: now,
      exp: exp
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(finalPayload));
    
    const signature = await createSignature(
      `${encodedHeader}.${encodedPayload}`,
      SECRET_KEY
    );
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  } catch (error) {
    console.error('토큰 생성 중 오류:', error);
    throw new Error('토큰 생성 실패');
  }
}

// JWT 토큰 검증
export async function verifyToken(token) {
  try {
    if (!token) {
      throw new Error('토큰이 없습니다.');
    }
    
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    // 서명 검증
    const expectedSignature = await createSignature(
      `${encodedHeader}.${encodedPayload}`,
      SECRET_KEY
    );
    
    if (signature !== expectedSignature) {
      throw new Error('서명이 일치하지 않습니다.');
    }
    
    // 페이로드 디코딩
    const payload = JSON.parse(atob(encodedPayload));
    
    // 만료 시간 검증
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error('토큰이 만료되었습니다.');
    }
    
    return payload;
  } catch (error) {
    console.error('토큰 검증 중 오류:', error);
    return null;
  }
}

// JWT 토큰에서 사용자 정보 추출
export function getUserFromToken(token) {
  try {
    if (!token) return null;
    
    const [, encodedPayload] = token.split('.');
    const payload = JSON.parse(atob(encodedPayload));
    
    return {
      email: payload.email,
      name: payload.name,
      exp: payload.exp
    };
  } catch (error) {
    console.error('토큰에서 사용자 정보 추출 중 오류:', error);
    return null;
  }
}

// 인증 상태 확인
export async function checkAuth() {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
      return false;
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      localStorage.removeItem('jwt_token');
      window.location.href = 'https://woo-2003.github.io/WEB_MAIN_20221022/login/login.html';
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('인증 상태 확인 중 오류:', error);
    return false;
  }
}
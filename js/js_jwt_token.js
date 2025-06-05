// JWT 비밀 키 (실제 운영 환경에서는 복잡한 키 사용 필수)
const JWT_SECRET = "your_secret_key_here";

// HMAC-SHA256 서명 생성 함수
async function createSignature(data, key) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(data);
    
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// JWT 토큰 생성
export async function generateToken(payload) {
    try {
        // 1. 헤더 생성 및 Base64 인코딩
        const header = { alg: "HS256", typ: "JWT" };
        const encodedHeader = btoa(JSON.stringify(header));
        
        // 2. 페이로드에 만료 시간 추가
        const tokenPayload = {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1시간
        };
        const encodedPayload = btoa(JSON.stringify(tokenPayload));
        
        // 3. 서명 생성
        const signature = await createSignature(
            `${encodedHeader}.${encodedPayload}`,
            JWT_SECRET
        );
        
        // 4. 최종 토큰 조합
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        console.error('JWT 생성 중 오류:', error);
        throw error;
    }
}

// JWT 토큰 검증
export async function verifyToken(token) {
    try {
        // 1. 토큰을 헤더, 페이로드, 서명으로 분할
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const [encodedHeader, encodedPayload, encodedSignature] = parts;
        
        // 2. 서명 재계산 및 비교
        const calculatedSignature = await createSignature(
            `${encodedHeader}.${encodedPayload}`,
            JWT_SECRET
        );
        
        if (calculatedSignature !== encodedSignature) return null;
        
        // 3. 페이로드 파싱 및 만료 시간 검증
        const payload = JSON.parse(atob(encodedPayload));
        
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            console.log('보안 토큰이 만료되었습니다');
            return null;
        }
        
        return payload;
    } catch (error) {
        console.error('JWT 검증 중 오류:', error);
        return null;
    }
}

// 인증 상태 확인
export async function checkAuth() {
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
}
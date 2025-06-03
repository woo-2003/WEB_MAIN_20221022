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

export async function generateJWT(payload) {
    try {
        // 1. 헤더 생성 및 Base64 인코딩
        const header = { alg: "HS256", typ: "JWT" };
        const encodedHeader = btoa(JSON.stringify(header));
        
        // 2. 페이로드 Base64 인코딩
        const encodedPayload = btoa(JSON.stringify(payload));
        
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

async function verifyJWT(token) {
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

async function isAuthenticated() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;
    
    const payload = await verifyJWT(token);
    console.log(payload);
    return !!payload;
}

export async function checkAuth() {
    const authenticated = await isAuthenticated();
    if (authenticated) {
        alert('정상적으로 토큰이 검증되었습니다.');
    }
}
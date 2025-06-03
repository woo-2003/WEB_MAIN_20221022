import { session_set, session_get, session_check } from './session.js';

// Base64 인코딩/디코딩 유틸리티 함수
function base64Encode(str) {
    try {
        // 문자열을 바이트 배열로 변환
        const bytes = new TextEncoder().encode(str);
        // 바이트 배열을 Base64로 인코딩
        return btoa(String.fromCharCode.apply(null, bytes));
    } catch (error) {
        console.error('Base64 인코딩 오류:', error);
        throw error;
    }
}

function base64Decode(str) {
    try {
        // Base64 문자열 검증
        if (!str || typeof str !== 'string') {
            throw new Error('유효하지 않은 Base64 문자열입니다.');
        }

        // Base64 문자열을 바이트 배열로 변환
        const binaryString = atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (error) {
        console.error('Base64 디코딩 오류:', error);
        throw error;
    }
}

// AES-256-GCM 암호화 함수
async function encodeByAES256(key, data) {
    try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        // 키 생성
        const cryptoKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(key.padEnd(32, " ")),
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        
        // IV 생성
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        // 암호화
        const encryptedData = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            dataBuffer
        );
        
        // IV와 암호화된 데이터를 결합
        const result = new Uint8Array(iv.length + encryptedData.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encryptedData), iv.length);
        
        // Base64 인코딩
        return base64Encode(String.fromCharCode.apply(null, result));
    } catch (error) {
        console.error('암호화 중 오류:', error);
        throw error;
    }
}

// AES-256-GCM 복호화 함수
async function decodeByAES256(key, data) {
    try {
        if (!data) {
            throw new Error('복호화할 데이터가 없습니다.');
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        // Base64 디코딩
        const bytes = base64Decode(data);
        
        // IV 추출
        const iv = bytes.slice(0, 12);
        const ciphertext = bytes.slice(12);
        
        // 키 생성
        const cryptoKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(key.padEnd(32, " ")),
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        
        // 복호화
        const decryptedData = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            ciphertext
        );
        
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('복호화 중 오류:', error);
        throw error;
    }
}

export async function encrypt_text(password) {
    try {
        if (!password) {
            throw new Error('암호화할 데이터가 없습니다.');
        }

        const k = "key"; // 클라이언트 키
        const eb = await encodeByAES256(k, password); // 실제 암호화
        console.log('암호화된 데이터:', eb);
        return eb;
    } catch (error) {
        console.error('암호화 중 오류:', error);
        throw error;
    }
}

export async function decrypt_text() {
    try {
        const k = "key"; // 서버의 키
        const eb = sessionStorage.getItem("Session_Storage_pass");
        
        if (!eb) {
            console.log('세션 스토리지에 암호화된 데이터가 없습니다.');
            return null;
        }

        // 세션 스토리지 데이터 검증
        try {
            base64Decode(eb);
        } catch (error) {
            console.error('세션 스토리지 데이터가 손상되었습니다.');
            sessionStorage.removeItem("Session_Storage_pass");
            return null;
        }
        
        const b = await decodeByAES256(k, eb); // 실제 복호화
        console.log('복호화된 데이터:', b);
        return b;
    } catch (error) {
        console.error('복호화 중 오류:', error);
        return null;
    }
}

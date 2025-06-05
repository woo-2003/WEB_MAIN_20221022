import { session_set, session_get, session_check } from './session.js';

// Base64 인코딩/디코딩 유틸리티 함수
function base64Encode(str) {
    try {
        const bytes = new TextEncoder().encode(str);
        return btoa(String.fromCharCode.apply(null, bytes));
    } catch (error) {
        console.error('Base64 인코딩 오류:', error);
        throw error;
    }
}

function base64Decode(str) {
    try {
        if (!str || typeof str !== 'string') {
            throw new Error('유효하지 않은 Base64 문자열입니다.');
        }

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
        
        const cryptoKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(key.padEnd(32, " ")),
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const encryptedData = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            dataBuffer
        );
        
        const result = new Uint8Array(iv.length + encryptedData.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encryptedData), iv.length);
        
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
        
        const bytes = base64Decode(data);
        
        const iv = bytes.slice(0, 12);
        const ciphertext = bytes.slice(12);
        
        const cryptoKey = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(key.padEnd(32, " ")),
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        
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

// 텍스트 암호화
export async function encryptText(text) {
    try {
        if (!text) {
            throw new Error('암호화할 데이터가 없습니다.');
        }

        const key = "key"; // 클라이언트 키
        const encryptedData = await encodeByAES256(key, text);
        return encryptedData;
    } catch (error) {
        console.error('암호화 중 오류:', error);
        throw error;
    }
}

// 텍스트 복호화
export async function decryptText(encryptedData) {
    try {
        if (!encryptedData) {
            return null;
        }

        const key = "key"; // 클라이언트 키
        
        // Base64 데이터 검증
        try {
            base64Decode(encryptedData);
        } catch (error) {
            console.error('암호화된 데이터가 손상되었습니다.');
            return null;
        }
        
        const decryptedData = await decodeByAES256(key, encryptedData);
        return decryptedData;
    } catch (error) {
        console.error('복호화 중 오류:', error);
        return null;
    }
}

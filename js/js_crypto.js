import { session_set, session_get, session_check } from './session.js';

// Base64 인코딩
export function base64Encode(str) {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
      }));
  } catch (error) {
    console.error('Base64 인코딩 중 오류:', error);
    return '';
  }
}

// Base64 디코딩
export function base64Decode(str) {
  try {
    return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (error) {
    console.error('Base64 디코딩 중 오류:', error);
    return '';
  }
}

// AES-256-GCM 암호화
export async function encodeByAES256(data) {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedData
    );
    
    const encryptedArray = new Uint8Array(encryptedData);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);
    
    return base64Encode(String.fromCharCode.apply(null, result));
  } catch (error) {
    console.error('AES 암호화 중 오류:', error);
    throw new Error('암호화 실패');
  }
}

// AES-256-GCM 복호화
export async function decodeByAES256(encryptedData) {
  try {
    const key = await getEncryptionKey();
    const decodedData = base64Decode(encryptedData);
    const dataArray = new Uint8Array(decodedData.length);
    
    for (let i = 0; i < decodedData.length; i++) {
      dataArray[i] = decodedData.charCodeAt(i);
    }
    
    const iv = dataArray.slice(0, 12);
    const encryptedArray = dataArray.slice(12);
    
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encryptedArray
    );
    
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('AES 복호화 중 오류:', error);
    throw new Error('복호화 실패');
  }
}

// 암호화 키 생성
async function getEncryptionKey() {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("your-secret-key"),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode("salt"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// 텍스트 암호화
export function encryptText(text) {
  try {
    if (!text) return '';
    return base64Encode(text);
  } catch (error) {
    console.error('텍스트 암호화 중 오류:', error);
    return '';
  }
}

// 텍스트 복호화
export function decryptText(encryptedText) {
  try {
    if (!encryptedText) return '';
    return base64Decode(encryptedText);
  } catch (error) {
    console.error('텍스트 복호화 중 오류:', error);
    return '';
  }
}

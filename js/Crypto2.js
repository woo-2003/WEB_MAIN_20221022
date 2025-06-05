// Web Crypto API를 사용한 AES-256-GCM 암호화/복호화 구현
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // GCM 모드에서는 12바이트 IV 권장

// 키 생성 함수
async function generateKey() {
    const key = await window.crypto.subtle.generateKey(
        {
            name: ALGORITHM,
            length: KEY_LENGTH
        },
        true,
        ['encrypt', 'decrypt']
    );
    return key;
}

// 키를 문자열로 내보내기
async function exportKey(key) {
    const exported = await window.crypto.subtle.exportKey(
        'raw',
        key
    );
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// 문자열에서 키 가져오기
async function importKey(keyString) {
    const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: ALGORITHM,
            length: KEY_LENGTH
        },
        true,
        ['encrypt', 'decrypt']
    );
}

// 암호화 함수
export async function encrypt(data) {
    try {
        if (!data) {
            throw new Error('암호화할 데이터가 없습니다.');
        }

        // 키 생성 또는 가져오기
        let key = sessionStorage.getItem('crypto_key');
        if (!key) {
            const newKey = await generateKey();
            key = await exportKey(newKey);
            sessionStorage.setItem('crypto_key', key);
        }
        const cryptoKey = await importKey(key);

        // IV 생성
        const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        // 데이터 암호화
        const encodedData = new TextEncoder().encode(data);
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: ALGORITHM,
                iv: iv
            },
            cryptoKey,
            encodedData
        );

        // IV와 암호화된 데이터를 결합하여 저장
        const result = {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encryptedData))
        };

        return btoa(JSON.stringify(result));
    } catch (error) {
        console.error('암호화 중 오류 발생:', error);
        throw error;
    }
}

// 복호화 함수
export async function decrypt(encryptedData) {
    try {
        if (!encryptedData) {
            throw new Error('복호화할 데이터가 없습니다.');
        }

        // 키 가져오기
        const key = sessionStorage.getItem('crypto_key');
        if (!key) {
            throw new Error('암호화 키가 없습니다.');
        }
        const cryptoKey = await importKey(key);

        // 암호화된 데이터 파싱
        const { iv, data } = JSON.parse(atob(encryptedData));

        // 데이터 복호화
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: ALGORITHM,
                iv: new Uint8Array(iv)
            },
            cryptoKey,
            new Uint8Array(data)
        );

        return new TextDecoder().decode(decryptedData);
    } catch (error) {
        console.error('복호화 중 오류 발생:', error);
        throw error;
    }
} 
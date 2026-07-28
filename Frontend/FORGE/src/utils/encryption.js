// End-to-end encryption utilities using Web Crypto API

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;

/**
 * Generate a random key for encryption
 */
export async function generateKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export key to base64 string for storage/transmission
 */
export async function exportKey(key) {
  const exported = await window.crypto.subtle.exportKey('jwk', key);
  return btoa(JSON.stringify(exported));
}

/**
 * Import key from base64 string
 */
export async function importKey(keyString) {
  const jwk = JSON.parse(atob(keyString));
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random IV (Initialization Vector)
 */
function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypt a message using AES-GCM
 */
export async function encryptMessage(message, key) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = generateIV();

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    // Combine IV and encrypted data, then convert to base64
    const ivArray = Array.from(iv);
    const encryptedArray = Array.from(new Uint8Array(encrypted));
    const combined = [...ivArray, ...encryptedArray];
    
    return btoa(String.fromCharCode.apply(null, combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message using AES-GCM
 */
export async function decryptMessage(encryptedData, key) {
  try {
    // Convert base64 to array
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Generate a key pair for asymmetric encryption (for key exchange)
 */
export async function generateKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );
}

/**
 * Export public key to base64
 */
export async function exportPublicKey(keyPair) {
  const exported = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import public key from base64
 */
export async function importPublicKey(publicKeyString) {
  const binaryString = atob(publicKeyString);
  const binaryArray = Uint8Array.from(binaryString, c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    'spki',
    binaryArray,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );
}

/**
 * Derive a shared secret using ECDH
 */
export async function deriveSharedKey(privateKey, publicKey) {
  return await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey,
    },
    privateKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

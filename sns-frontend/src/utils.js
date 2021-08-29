/* eslint-disable no-mixed-operators */
export const pad = (initialO, paddingChar, minLength) => {
  let initial = initialO.toString();
  let length = minLength - initial.length;
  if (length <= 0) {
    return initial;
  }
  return paddingChar.repeat(length) + initial;
}

export const dateFormatter = epoch => {
  let d = new Date(epoch * 1000)
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${pad(d.getHours(), '0', 2)}:${pad(d.getMinutes(), '0', 2)}`
};

export const getStatusFromNumber = n => {
  if (n === 0) return 'unresolved'
  if (n === 1) return 'spam'
  if (n === 2) return 'resolved'
}

const importPassword = password => {
  let enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  )
}

export const getCachedSymmetricEncryptionKey = () => (
  window.crypto.subtle.importKey(
    "raw",
    base64DecToArr(localStorage.getItem('symenc')),
    { name: 'AES-GCM', length: 128 },
    true,
    ["encrypt", "decrypt"]
  )
)

export const importEncodedPublicKey = publicKey => (
  window.crypto.subtle.importKey(
    "spki",
    base64DecToArr(publicKey),
    { name: "ECDH", namedCurve: 'P-256' },
    true,
    []
  )
)

export const importPrivateKeyBytes = privateKey => (
  window.crypto.subtle.importKey(
    "pkcs8",
    privateKey,
    { name: "ECDH", namedCurve: 'P-256' },
    true,
    ["deriveBits", "deriveKey"]
  )
)

export const importEncEncPrivateKey = async (privateKey, symmetricEncryptionKey, iv) => {
  const encryptedPrivate = base64DecToArr(privateKey);
  const plaintextPrivate = await decryptSymmetric(encryptedPrivate, symmetricEncryptionKey, iv);
  const privateKeyImported = await importPrivateKeyBytes(plaintextPrivate);
  return privateKeyImported;
}

export const getSymmetricEncryptionKey = async (password, salt) => {
  let material = await importPassword(password);
  let result = await window.crypto.subtle.deriveKey(
    {
      "name": "PBKDF2",
      salt: salt,
      "iterations": 100000,
      "hash": "SHA-256"
    },
    material,
    { "name": "AES-GCM", "length": 128},
    true,
    [ "encrypt", "decrypt" ]
  )
  return result;
};

export const getServerPassword = async (password, salt) => {
  let material = await importPassword(password);
  return await window.crypto.subtle.deriveKey(
    {
      "name": "PBKDF2",
      salt: salt,
      "iterations": 200000,
      "hash": "SHA-256"
    },
    material,
    { "name": "AES-GCM", "length": 128},
    true,
    [ "encrypt", "decrypt" ]
  );
};

export const generateKeypair = () => (
  window.crypto.subtle.generateKey(
    {
        name: "ECDH",
        namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"]
  )
)

export const encryptSymmetric = (plaintext, symmetricEncryptionKey, iv) => (
  window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv, // buffersource
    },
    symmetricEncryptionKey, // cryptokey
    plaintext, // needs to be a buffer source
  )
)

export const decryptSymmetric = (ciphertext, symmetricEncryptionKey, iv) => (
  window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv, // buffersource
    },
    symmetricEncryptionKey, // cryptokey
    ciphertext, // needs to be a buffer source
  )
)

export const getSharedKey = (privateKey, publicKey) => {
  return window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
      public: publicKey,
    },
    privateKey,
    { name: 'AES-GCM', length: 128 },
    true,
    ["encrypt", "decrypt"]
  )
}

export const encryptAsymmetric = async (plaintext, privateKey, publicKey, iv) => {
  let key = await getSharedKey(privateKey, publicKey);
  return await encryptSymmetric(plaintext, key, iv);
}

export const decryptAsymmetric = async (ciphertext, privateKey, publicKey, iv) => {
  let key = await getSharedKey(privateKey, publicKey);
  return await decryptSymmetric(ciphertext, key, iv);
}

// Source: MDN
function b64ToUint6 (nChr) {
  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0;
}

// Source: MDN
export function base64DecToArr (sBase64, nBlocksSize) {
  var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUint24 = 0;
    }
  }

  return taBytes;
}

/* Base64 string to array encoding */
// Source: MDN
function uint6ToB64 (nUint6) {
  return nUint6 < 26 ?
      nUint6 + 65
    : nUint6 < 52 ?
      nUint6 + 71
    : nUint6 < 62 ?
      nUint6 - 4
    : nUint6 === 62 ?
      43
    : nUint6 === 63 ?
      47
    :
      65;
}

// Source: MDN
export function base64EncArr (aBytesLong) {
  const aBytes = new Uint8Array(aBytesLong);
  var nMod3 = 2, sB64Enc = "";

  for (var nLen = aBytes.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
    nMod3 = nIdx % 3;
    if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) { sB64Enc += "\r\n"; }
    nUint24 |= aBytes[nIdx] << (16 >>> nMod3 & 24);
    if (nMod3 === 2 || aBytes.length - nIdx === 1) {
      sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63), uint6ToB64(nUint24 >>> 12 & 63), uint6ToB64(nUint24 >>> 6 & 63), uint6ToB64(nUint24 & 63));
      nUint24 = 0;
    }
  }

  return sB64Enc.substr(0, sB64Enc.length - 2 + nMod3) + (nMod3 === 2 ? '' : nMod3 === 1 ? '=' : '==')
}


/**
 * CryptoService handles all client-side encryption and decryption.
 */

export const generateRSAKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const exportedPublic = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const exportedPrivate = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    exportedPublicKey: btoa(String.fromCharCode(...new Uint8Array(exportedPublic))),
    exportedPrivateKey: btoa(String.fromCharCode(...new Uint8Array(exportedPrivate))),
  };
};

export const encryptFile = async (file: File, publicKey: CryptoKey) => {
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();
  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    fileBuffer
  );

  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedAesKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey
  );

  return {
    encryptedBlob: new Blob([encryptedContent]),
    encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encryptedAesKey))),
    iv: btoa(String.fromCharCode(...iv)),
    rawAesKey: rawAesKey // Returned so owner can re-encrypt for sharing
  };
};

export const decryptAesKey = async (
  encryptedKeyBase64: string,
  privateKey: CryptoKey
) => {
  const encryptedAesKey = Uint8Array.from(atob(encryptedKeyBase64), c => c.charCodeAt(0));
  return await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedAesKey
  );
};

export const decryptFile = async (
  encryptedBlob: Blob,
  decryptedAesKeyRaw: ArrayBuffer,
  ivBase64: string
) => {
  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    decryptedAesKeyRaw,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const encryptedBuffer = await encryptedBlob.arrayBuffer();
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer]);
};

export const importPublicKey = async (base64Key: string) => {
  const binaryKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "spki",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
};

export const encryptAesKeyForRecipient = async (
  rawAesKey: ArrayBuffer,
  recipientPublicKey: CryptoKey
) => {
  const encryptedAesKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientPublicKey,
    rawAesKey
  );
  return btoa(String.fromCharCode(...new Uint8Array(encryptedAesKey)));
};

export const importPrivateKey = async (base64Key: string) => {
  const binaryKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
};

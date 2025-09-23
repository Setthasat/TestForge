// AES-GCM (Advanced Encryption Standard in Galois Counter Mode)

export async function generateKey(): Promise<CryptoKey> {
  //generate key for encrypt, decrypt
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
}

// Encrypt data with AES-GCM
export async function encryptData(
  plaintext: string,
  key: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder(); //string -> bytes (UTF-8)
  const iv = crypto.getRandomValues(new Uint8Array(12)); // random iv 12 bytes
  const encoded = encoder.encode(plaintext); // encode string -> byte array

  // use key + iv for encrypt
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const ivAndCipher = new Uint8Array(iv.byteLength + cipherBuffer.byteLength); // combine IV + ciphertext

  // set IV then concat ciphertext
  ivAndCipher.set(iv, 0);
  ivAndCipher.set(new Uint8Array(cipherBuffer), iv.byteLength);

  // bytes -> binary string
  let binary = "";
  for (let i = 0; i < ivAndCipher.length; i++)
    binary += String.fromCharCode(ivAndCipher[i]);

  return btoa(binary); // binary string -> base64
}

// Decrypt AES-GCM decrypted data
export async function decryptData(
  base64: string,
  key: CryptoKey
): Promise<string> {
  const binary = atob(base64); // decode base64 -> binary string
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0)); // binary string -> byte array
  const iv = bytes.slice(0, 12); // get first IV 12 bytes
  const cipher = bytes.slice(12); // get ciphertext

  // use key + iv for decrypted
  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher
  );
  
  //bytes -> string UTF-8
  const decoder = new TextDecoder();
  return decoder.decode(plainBuffer);
}

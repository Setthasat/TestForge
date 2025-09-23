
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = encoder.encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const ivAndCipher = new Uint8Array(iv.byteLength + cipherBuffer.byteLength);
  ivAndCipher.set(iv, 0);
  ivAndCipher.set(new Uint8Array(cipherBuffer), iv.byteLength);
  let binary = "";
  for (let i = 0; i < ivAndCipher.length; i++) binary += String.fromCharCode(ivAndCipher[i]);
  return btoa(binary);
}

export async function decryptData(base64: string, key: CryptoKey): Promise<string> {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const iv = bytes.slice(0, 12);
  const cipher = bytes.slice(12);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  const decoder = new TextDecoder();
  return decoder.decode(plainBuffer);
}

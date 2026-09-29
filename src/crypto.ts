// Handles turning a master password into an encryption key, and using that
// key to scramble/unscramble text. The password itself is never stored.

const ITERATIONS = 600_000; // deliberately slow, to resist password-guessing
const CHECK_PLAINTEXT = 'vault-unlock-check-v1';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)));
}

async function deriveKey(password: string, saltB64: string): Promise<CryptoKey> {
  const salt = fromBase64(saltB64);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptString(key: CryptoKey, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, enc.encode(plaintext));
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return toBase64(combined);
}

export async function decryptString(key: CryptoKey, combinedB64: string): Promise<string> {
  const combined = fromBase64(combinedB64);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );
  return new TextDecoder().decode(plainBuf);
}

// Used the very first time: creates a brand new key from a chosen password,
// plus a "check" value we can use later to confirm a re-entered password is correct.
export async function createVaultKey(
  password: string
): Promise<{ key: CryptoKey; salt: string; check: string }> {
  const salt = generateSalt();
  const key = await deriveKey(password, salt);
  const check = await encryptString(key, CHECK_PLAINTEXT);
  return { key, salt, check };
}

// Used on every subsequent app open: re-derives the key from the entered
// password and confirms it's correct by decrypting the stored check value.
// Returns null if the password was wrong.
export async function unlockVaultKey(
  password: string,
  salt: string,
  check: string
): Promise<CryptoKey | null> {
  try {
    const key = await deriveKey(password, salt);
    const plaintext = await decryptString(key, check);
    return plaintext === CHECK_PLAINTEXT ? key : null;
  } catch {
    return null;
  }
}

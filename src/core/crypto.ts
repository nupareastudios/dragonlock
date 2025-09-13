import { createCipheriv, createDecipheriv, randomBytes, scrypt as scryptCb } from "node:crypto";

export type SupportedCipher = "aes-256-gcm";
export type SupportedKdf = "argon2id" | "scrypt";

export interface EncryptionResult {
  iv: Buffer;
  ciphertext: Buffer;
  tag: Buffer;
}

export interface DeriveKeyResult {
  key: Buffer;
  kdf: SupportedKdf;
  salt: Buffer;
}

export function generateSalt(length = 16): Buffer {
  return randomBytes(length);
}

export function generateIv(length = 12): Buffer {
  return randomBytes(length);
}

export async function deriveKey(
  masterPassword: string,
  salt: Buffer,
  preferred: SupportedKdf = "argon2id",
): Promise<DeriveKeyResult> {
  if (preferred === "argon2id") {
    const argon2 = await tryLoadArgon2();
    if (argon2) {
      const key = (await argon2.hash(masterPassword, {
        type: argon2.argon2id,
        salt,
        memoryCost: 64 * 1024,
        timeCost: 3,
        parallelism: 1,
        hashLength: 32,
        raw: true,
      })) as Buffer;
      return { key, kdf: "argon2id", salt };
    }
  }
  const key = await scryptWithOptions(masterPassword, salt, 32, {
    N: 1 << 15,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return { key, kdf: "scrypt", salt };
}

export async function deriveKeyFor(
  masterPassword: string,
  salt: Buffer,
  algorithm: SupportedKdf,
): Promise<Buffer> {
  if (algorithm === "argon2id") {
    const argon2 = await tryLoadArgon2();
    if (!argon2) {
      throw new Error("argon2id required to open this vault but argon2 module is not available");
    }
    const key = (await argon2.hash(masterPassword, {
      type: argon2.argon2id,
      salt,
      memoryCost: 64 * 1024,
      timeCost: 3,
      parallelism: 1,
      hashLength: 32,
      raw: true,
    })) as Buffer;
    return key;
  }
  return scryptWithOptions(masterPassword, salt, 32, {
    N: 1 << 15,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
}

export function encryptAesGcm(plaintext: Buffer, key: Buffer): EncryptionResult {
  if (key.length !== 32) throw new Error("AES-256-GCM requires 32-byte key");
  const iv = generateIv();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, ciphertext, tag };
}

export function decryptAesGcm(ciphertext: Buffer, key: Buffer, iv: Buffer, tag: Buffer): Buffer {
  if (key.length !== 32) throw new Error("AES-256-GCM requires 32-byte key");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext;
}

async function tryLoadArgon2(): Promise<any | null> {
  try {
    // Use dynamic import to avoid hard dependency
    const mod: any = await (Function("m", "return import(m)") as any)("argon2");
    return mod;
  } catch {
    return null;
  }
}

function scryptWithOptions(
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N?: number; r?: number; p?: number; maxmem?: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    (scryptCb as unknown as (
      password: string | Buffer,
      salt: string | Buffer,
      keylen: number,
      options: { N?: number; r?: number; p?: number; maxmem?: number },
      cb: (err: Error | null, derivedKey: Buffer) => void,
    ) => void)(password, salt, keylen, options, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });
} 
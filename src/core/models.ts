export interface VaultEntry {
  id: string;
  service: string;
  username: string;
  password: string;
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface VaultData {
  createdAt: string; // ISO
  updatedAt: string; // ISO
  entries: VaultEntry[];
}

export type KdfType = "argon2id" | "scrypt";

export interface EncryptedVault {
  version: 1;
  kdf: KdfType;
  salt: string; // base64
  cipher: "aes-256-gcm";
  iv: string; // base64
  tag: string; // base64
  blob: string; // base64
}

export function encodeBase64(buf: Buffer): string {
  return buf.toString("base64");
}

export function decodeBase64(b64: string): Buffer {
  return Buffer.from(b64, "base64");
} 
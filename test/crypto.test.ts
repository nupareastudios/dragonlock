import { describe, it, expect } from "vitest";
import {
  decryptAesGcm,
  encryptAesGcm,
  deriveKeyFor,
  generateSalt,
} from "../src/core/crypto.js";

describe("crypto round-trip", () => {
  it("scrypt + aes-256-gcm encrypt/decrypt", async () => {
    const password = "test-password";
    const salt = generateSalt(16);
    const key = await deriveKeyFor(password, salt, "scrypt");
    const plaintext = Buffer.from("hello world");
    const { iv, ciphertext, tag } = encryptAesGcm(plaintext, key);
    const roundtrip = decryptAesGcm(ciphertext, key, iv, tag);
    expect(roundtrip.toString("utf8")).toBe("hello world");
  });

  it("fails decryption with wrong password", async () => {
    const salt = generateSalt(16);
    const key1 = await deriveKeyFor("pw1", salt, "scrypt");
    const { iv, ciphertext, tag } = encryptAesGcm(Buffer.from("secret"), key1);
    const key2 = await deriveKeyFor("pw2", salt, "scrypt");
    expect(() => decryptAesGcm(ciphertext, key2, iv, tag)).toThrowError();
  });
}); 
### src/core/crypto.ts

Key derivation:
- `deriveKey(master: string, salt: Buffer, preferred: "argon2id"|"scrypt")`
  - Tries argon2id first (dynamic import), else scrypt.
  - Returns `{ key: Buffer, kdf: "argon2id"|"scrypt", salt: Buffer }`.
  - Argon2 parameters: memoryCost=64MiB, timeCost=3, parallelism=1, hashLength=32.
  - Scrypt parameters: N=32768, r=8, p=1, maxmem≈64MiB.
- `deriveKeyFor(master: string, salt: Buffer, algorithm)`
  - Deterministically derives a key with the specified algorithm (used on load).

AEAD (AES‑GCM):
- `encryptAesGcm(plaintext: Buffer, key: Buffer)`
  - Generates random 12-byte IV; returns `{ iv, ciphertext, tag }`.
- `decryptAesGcm(ciphertext, key, iv, tag)`
  - Verifies tag and returns plaintext.

Helpers:
- `generateSalt(length=16)` and `generateIv(length=12)`.
- Internal `tryLoadArgon2()` loads `argon2` if present; otherwise null. 
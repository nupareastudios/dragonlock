### Phase 2 — Crypto layer

What this phase adds:
- KDF (argon2id preferred, scrypt fallback)
- AES-256-GCM encryption/decryption helpers
- Encrypted load/save integration in `Vault`
- Crypto-focused tests

Files:
- `src/core/crypto.ts`
- `src/core/vault.ts` (encrypted APIs)
- `test/crypto.test.ts`
- `test/vault.encrypted.test.ts` 
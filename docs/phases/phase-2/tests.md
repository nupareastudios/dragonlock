### test/crypto.test.ts
- Scrypt+AES‑GCM round-trip returns original plaintext.
- Wrong password produces decrypt error.

### test/vault.encrypted.test.ts
- Encrypted init/save/load; data survives round-trip.
- Wrong password rejects with error. 
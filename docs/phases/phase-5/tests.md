### test/crypto.test.ts
- scrypt round-trip success
- wrong-password decrypt failure

### test/vault.encrypted.test.ts
- init/save/load encrypted OK with correct password
- wrong password throws

### test/vault.duplicates.test.ts
- multiple entries allowed per service
- deleteByService removes all (case-insensitive) 
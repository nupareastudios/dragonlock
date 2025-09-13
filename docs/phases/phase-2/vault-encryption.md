### src/core/vault.ts (encrypted)

Methods:
- `static initEncrypted(filePath, master)`
  - Creates empty vault and immediately writes encrypted container using a fresh salt.
- `static loadEncrypted(filePath, master)`
  - Reads JSON container, decodes base64 fields, derives key using container.kdf, decrypts, parses `VaultData`.
  - Errors: missing file, unsupported version, wrong password/corruption, invalid JSON.
- `saveEncrypted(master)`
  - Updates timestamps; serializes `VaultData`.
  - Derives key with a fresh random salt; AES‑GCM encrypts with fresh IV.
  - Writes container:
    ```json
    {
      "version": 1,
      "kdf": "argon2id|scrypt",
      "salt": "<base64>",
      "cipher": "aes-256-gcm",
      "iv": "<base64>",
      "tag": "<base64>",
      "blob": "<base64>"
    }
    ``` 
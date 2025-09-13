### src/core/models.ts

Types:
- `VaultEntry`
  - `id: string`: UUID v4
  - `service: string`: service key
  - `username: string`
  - `password: string`
  - `notes?: string`
  - `createdAt: string` (ISO)
  - `updatedAt: string` (ISO)
- `VaultData`
  - `createdAt`, `updatedAt`, `entries: VaultEntry[]`
- `KdfType`: `"argon2id" | "scrypt"`
- `EncryptedVault`
  - `version: 1`
  - `kdf: KdfType`
  - `salt`, `iv`, `tag`, `blob`: base64 strings
  - `cipher: "aes-256-gcm"`

Helpers:
- `encodeBase64(buf: Buffer): string`
  - Encodes binary to base64 for JSON container.
- `decodeBase64(b64: string): Buffer`
  - Decodes base64 back to binary buffers. 
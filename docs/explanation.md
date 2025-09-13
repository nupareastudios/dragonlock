### DragonLock codebase explanation (phase-by-phase)

This document explains what each file does, grouped by the build phases in `docs/dragonlock.md`.

### Phase 0 — Bootstrap

- `package.json`
  - **bin**: exposes the CLI as `dragonlock` → `dist/index.js`.
  - **scripts**: `build`, `dev` (tsx runner), `lint`, `test`, `format`.
  - **deps**: `commander`, `env-paths`, `inquirer`, `clipboardy`, `uuid`.
  - **devDeps**: TypeScript, tsx, ESLint, Prettier, Vitest, Node types.
- `tsconfig.json`
  - **ESM NodeNext** config, strict mode, outputs to `dist/`.
  - Includes `src/` (build) and tests excluded from emit.
- `.eslintrc.cjs` / `.prettierrc`
  - Linting and formatting config; minimal rules, 100-col width.
- `.gitignore`
  - Ignores `node_modules/`, `dist/`, logs, `.env`.
- `README.md`
  - User-facing quickstart, commands, flags, vault paths, security notes.
- `src/index.ts`
  - Shebang entrypoint that imports and runs the CLI program, propagates non-zero exit on errors.
- `src/cli/index.ts`
  - Wires the `commander` program.
  - Global options: `--vault <path>`, `--json`.
  - Registers subcommands from `src/cli/commands/*`.

### Phase 1 — Core models & storage

- `src/core/models.ts`
  - Types: `VaultEntry`, `VaultData`, `EncryptedVault`, `KdfType`.
  - Helpers: `encodeBase64`, `decodeBase64` for binary ↔ base64.
- `src/core/storage.ts`
  - `resolveVaultPath(override?)`: default OS-appropriate config path using `env-paths`.
  - `ensureDirForFile`, `readFileSafe` (ENOENT→null), `atomicWriteFile` (tmp+rename).
- `src/core/vault.ts`
  - In-memory plain JSON vault (Phase 1 path) with CRUD:
    - `createNew`, `loadPlaintext`, `savePlaintext`.
    - `getAllEntries`, `listServices`, `findEntriesByService` (case-insensitive),
      `addEntry`, `updateEntry`, `deleteByService`.
    - Timestamps kept in ISO; IDs via `uuid`.
- `test/vault.test.ts`
  - Plaintext CRUD round-trip: create → add → save → reload → delete → save → reload.

### Phase 2 — Crypto layer

- `src/core/crypto.ts`
  - KDF:
    - `deriveKey(master, salt, preferred)`: returns `{ key, kdf, salt }` using `argon2id` when available, else `scrypt`.
    - `deriveKeyFor(master, salt, algorithm)`: derive using a specific KDF (used for load).
  - AEAD:
    - `encryptAesGcm(plaintext, key)` → `{ iv, ciphertext, tag }`.
    - `decryptAesGcm(ciphertext, key, iv, tag)` → `plaintext`.
  - Salt/IV helpers: `generateSalt`, `generateIv`.
- `src/core/vault.ts` (encrypted flow additions)
  - `initEncrypted(filePath, master)`: creates empty vault and writes encrypted container.
  - `loadEncrypted(filePath, master)`: reads JSON container, derives key based on `kdf`, decrypts, validates JSON, returns `Vault`.
  - `saveEncrypted(master)`: serializes `VaultData`, derives key with new random salt, AES‑GCM encrypts, writes container with `{version,kdf,salt,iv,tag,blob}`.
- `test/crypto.test.ts`
  - Scrypt+AES‑GCM round-trip and wrong-password failure assertion.
- `test/vault.encrypted.test.ts`
  - Encrypted vault lifecycle (init/save/load) and wrong-password rejection.

### Phase 3 — CLI scaffolding

- `src/ui/prompts.ts`
  - Inquirer prompts:
    - `askMasterPassword(confirm?)`: masked input + optional confirmation.
    - `askEntryFields()`: service, username, password (optional), notes.
    - `confirmWipe(code)`: destructive action confirmation.
- `src/cli/commands/init.ts`
  - `dragonlock init`: resolves path, guards if file exists, asks master password twice, initializes encrypted vault.
- `src/cli/commands/add.ts`
  - `dragonlock add`: asks master, decrypts vault, prompts fields, auto-generates password if blank, saves encrypted; supports `--json`.
- `src/cli/commands/list.ts`
  - `dragonlock list`: asks master, decrypts vault, prints `{service, username}`; supports `--json`.
- `src/cli/commands/get.ts`
  - `dragonlock get <service> [--copy]`: asks master, decrypts vault, prints entry; `--copy` puts password on clipboard; multiple entries listed compactly; supports `--json`.
- `src/cli/commands/delete.ts`
  - `dragonlock delete <service>`: asks master, decrypts, removes all entries for service (case-insensitive), saves encrypted.
- `src/cli/commands/wipe.ts`
  - `dragonlock wipe`: destructive; requires typing a random code; deletes vault file.
- `src/cli/commands/generate.ts`
  - `dragonlock generate [length] [--alphabet <name>]`: emits a strong password; supports `--json`.

### Phase 4 — UX polish

- `src/core/password.ts`
  - Generator now supports selectable alphabets:
    - `base64url` (default), `ascii`, `alnum`, `alnum-symbols`, `hex`, `numeric`.
  - API: `generatePassword(length?, alphabet?)`.
- `src/cli/commands/get.ts`
  - `--ttl <seconds>`: best-effort auto-clear of clipboard after copying.
- `src/cli/commands/generate.ts`
  - `--alphabet <name>` flag wired to generator.

### Phase 5 — Tests & hardening

- `test/vault.duplicates.test.ts`
  - Confirms multiple entries per service are allowed; delete is case-insensitive and removes all.
- `test/vault.encrypted.test.ts`
  - Validates encrypted round-trip and wrong-password behavior across file IO.

### Support files (cross-phase)

- `src/core/storage.ts`
  - Cross-platform config path via `env-paths`; atomic file writes, safe reads.
- `src/index.ts`, `src/cli/index.ts`
  - ESM entry + command registration + global flags.

### Behavioral notes

- KDF: prefers `argon2id` if the optional `argon2` module is present; otherwise uses `scrypt` with sane parameters.
- Encryption: each `saveEncrypted` uses a fresh random salt and IV; entire vault content is encrypted; container metadata (`kdf`, `salt`, `iv`, `tag`, `blob`) is plaintext JSON.
- CLI output: `--json` produces machine-readable output; emojis by default for human-friendly UX.
- Clipboard: password copy uses `clipboardy`; `--ttl` clears clipboard after N seconds (best-effort). 
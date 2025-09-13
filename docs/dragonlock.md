# DragonLock

# 1. What we’re building

DragonLock is a local-first, offline, **CLI password vault** for developers. It stores credentials in an **encrypted file** on disk, protected by a **master password**. It’s fast, minimal, and fun to use with emoji-driven prompts. No cloud. No telemetry. Just keys.

## 2. Why it’s helpful

- **Local-first security:** Your secrets never leave your machine.
- **Dev-friendly:** Scriptable CLI that plays nice with terminals, dotfiles, and automation.
- **Lightweight:** No servers, no browsers, no Electron.
- **Hackathon-ready:** Narrow scope → deliverable MVP in hours.

## 3. What it’s *not*

- ❌ Not a cloud sync manager (no multi-device sync).
- ❌ Not a team/shared secrets tool.
- ❌ Not a browser extension or autofill utility (yet).
- ❌ Not an HSM or enterprise secrets store.

---

## 4. Core user stories

- As a user, I can **init** a vault with a master password.
- I can **add** a credential (service, username, password, notes).
- I can **list** services without revealing passwords.
- I can **get** a credential by service (optionally copy the password to clipboard).
- I can **delete** a credential.
- I can **wipe** the vault (with scary confirmation).
- (Nice-to-have) I can **generate** strong random passwords.

---

## 5. Security model (Node.js)

- **Encryption:** AES-256-GCM via `node:crypto`.
- **Key derivation:** `argon2id` (via `argon2` package). Fallback: `scrypt` from `node:crypto`.
- **Salts & IVs:** Random per vault (salt) and per encryption (IV: 12 bytes). Store alongside ciphertext.
- **Auth:** GCM tag provides integrity (no separate MAC).
- **At rest:** Entire vault content is encrypted. Filenames & metadata remain plaintext.
- **Memory hygiene:** Avoid long-lived plaintext; overwrite Buffers when possible; don’t log secrets.
- **Clipboard:** Use `clipboardy` with an optional auto-clear timer (if time permits).

Vault file layout (JSON, encrypted `blob`):

```json
{
  "version": 1,
  "kdf": "argon2id",
  "salt": "<base64>",
  "cipher": "aes-256-gcm",
  "iv": "<base64>",
  "tag": "<base64>",
  "blob": "<base64>" // encrypted serialized vault data
}
```

Decrypted vault data (before encrypting) looks like:

```json
{
  "createdAt": "2025-08-08T10:10:00.000Z",
  "updatedAt": "2025-08-08T10:10:00.000Z",
  "entries": [
    {
      "id": "uuid",
      "service": "github",
      "username": "ony",
      "password": "supersecret",
      "notes": "",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

## 6. Technical stack

- **Runtime:** Node.js (LTS)
- **Lang:** TypeScript (strict mode)
- **CLI:** `commander` (commands/flags) + `inquirer` (prompts/masking)
- **Crypto:** `argon2`, `node:crypto` (AES-GCM), `crypto.randomBytes`
- **Paths:** `env-paths` (cross-platform app data dir) or `os.homedir()`
- **Serialization:** Native JSON
- **Clipboard:** `clipboardy`
- **Timestamps/IDs:** `uuid`
- **Testing:** `vitest` (or `jest`)
- **Lint/Format:** `eslint` + `prettier`
- **Dev QoL:** `tsx` for fast TS execution / `ts-node` alternative

---

## 7. CLI surface (v1)

```
dragonlock init
dragonlock add                # prompts for service, username, password, notes
dragonlock list               # shows services & usernames only
dragonlock get <service>      # prints fields; --copy to clipboard password
dragonlock delete <service>
dragonlock wipe               # dangerous, requires confirmation
dragonlock generate [length]  # spits a strong password (optional)
```

Global flags:

- `-vault <path>` override default vault location.
- `-json` for machine-readable output where relevant.

---

## 8. Folder structure

```sql
dragonlockjs/
├─ src/
│  ├─ cli/
│  │  ├─ index.ts            # commander wiring
│  │  ├─ commands/
│  │  │  ├─ init.ts
│  │  │  ├─ add.ts
│  │  │  ├─ list.ts
│  │  │  ├─ get.ts
│  │  │  ├─ delete.ts
│  │  │  └─ wipe.ts
│  ├─ core/
│  │  ├─ vault.ts            # load/save, CRUD, schema
│  │  ├─ crypto.ts           # kdf, encrypt/decrypt helpers
│  │  ├─ models.ts           # TS types
│  │  ├─ storage.ts          # path resolution, fs ops
│  │  └─ password.ts         # generator, strength utils (optional)
│  ├─ ui/
│  │  └─ prompts.ts          # inquirer wrappers, emoji UX
│  └─ index.ts               # binary entry (#!/usr/bin/env node)
├─ test/                     # unit tests
├─ package.json
├─ tsconfig.json
├─ .eslintrc.cjs
├─ .prettierrc
└─ README.md

```

Default vault path:

- macOS/Linux: `~/.dragonlock/dragonlock.vault.json`
- Windows: `%APPDATA%\dragonlock\dragonlock.vault.json`
    
    (using `env-paths` to be neat)
    

---

## 9. Error handling & UX notes

- Friendly errors with emojis:
    - 🔐 Wrong master password
    - 🗃️ Vault not initialized
    - 🧹 Wipe confirmation
- Non-zero exit codes for automation.
- Never print secrets unless explicitly requested (and warn).
- `-json` mode suppresses emojis for scripting.

---

## 10. Build plan (chronological, time-boxed)

### Phase 0 — Bootstrap (15–20m)

1. `pnpm init` (or npm/yarn)
2. Add deps: `typescript tsx commander inquirer argon2 clipboardy env-paths uuid eslint prettier vitest @types/node`
3. `tsconfig.json`, ESLint+Prettier, `bin` entry in `package.json` (`"bin": {"dragonlock": "dist/index.js"}`).

### Phase 1 — Core models & storage (45m)

1. `models.ts`: define `Vault`, `VaultEntry`.
2. `storage.ts`: resolve vault path (via `env-paths`), read/write file safely, create dir if missing.
3. `vault.ts`: in-memory vault, CRUD (no crypto yet). Serialize/deserialize with updated timestamps. Validation guards.

### Phase 2 — Crypto layer (60–75m)

1. `crypto.ts`:
    - `deriveKey(masterPassword, salt)` using `argon2id`.
    - `encrypt(plaintext, key)` → `{iv, tag, ciphertext}`.
    - `decrypt(blob, key)` → `plaintext`.
2. Integrate with `vault.ts` load/save: encrypt entire serialized vault data; on save: new IV each time; on init: new salt.

### Phase 3 — CLI scaffolding (45–60m)

1. `cli/index.ts` with `commander`.
2. Commands:
- `init`: prompt master password twice; create empty encrypted vault.
- `add`: decrypt → push entry → encrypt → save.
- `list`: decrypt → table of `{service, username, updatedAt}`.
- `get <service>`: decrypt → print fields; `-copy` puts password on clipboard and prints a short notice.
- `delete <service>`: decrypt → remove → save.
- `wipe`: confirm with full service name or random code → delete file.

### Phase 4 — UX polish (30–45m)

1. `ui/prompts.ts`: inquirer with masked inputs; emoji prompts (🗝️ add, 🔍 get, 🧹 wipe).
2. Password generator util (random bytes → base64url or custom alphabet).
3. Optional: auto-clear clipboard (setTimeout best-effort).

### Phase 5 — Tests & hardening (30–45m)

1. Unit tests for `crypto.ts` (round-trip), `vault.ts` CRUD.
2. Manual tests: wrong password, empty vault, duplicate service handling (either overwrite with confirm or support multiple entries per service).

### Phase 6 — Docs & release (20–30m)

1. `README.md`: install, usage examples, security notes, limitations.
2. Add example gifs (asciinema) if time.
3. Tag v0.1.0.

**Stretch (if time):**

- `export --qr` (print QR of an encrypted export blob).
- TUI via `ink` for a fancier list view.
- Multiple vaults (`-profile work|personal`).

---

## 11. Data lifecycle & performance

- Vault is small (< few MB). Full decrypt → mutate → encrypt on each write. Simple and safe.
- Use atomic writes: write temp file then rename to avoid corruption.
- Backups: keep `.bak` of last good vault (optional toggle).

---

## 12. Threat model (pragmatic)

- Protects against disk theft or casual snooping without master password.
- Not resilient against a compromised OS or active keyloggers.
- Clipboard use is risky; warn user; offer `-copy` opt-in and short TTL clear.

---

## 13. Scripts (package.json)

```json
json
CopyEdit
{
  "type": "module",
  "bin": { "dragonlock": "dist/index.js" },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "lint": "eslint .",
    "test": "vitest",
    "format": "prettier -w ."
  }
}

```

---

## 14. Example flows

**Initialize**

```
$ dragonlock init
🔐 Create master password: ********
🔐 Confirm master password: ********
✅ Vault created at ~/.dragonlock/dragonlock.vault.json

```

**Add**

```
$ dragonlock add
🔐 Enter master password: ********
🗝️ Service: github
👤 Username: ony
🔒 Password: ********  (leave blank to auto-generate)
📝 Notes: personal account
✅ Saved!

```

**Get**

```
$ dragonlock get github --copy
🔐 Enter master password: ********
🔍 github / ony
🔑 Password copied to clipboard (auto-clears in 30s)

```

**List**

```
$ dragonlock list
🔐 Enter master password: ********
🗂️  Services:
- github (ony)
- aws (ony.work)

```

---

## 15. Limitations & next steps

- No sync/sharing; single-user only.
- No browser autofill (future: native messaging or extension).
- Clipboard can leak; warn users.
- Future: OTP storage, passkeys, hardware-backed keys (WebAuthn/TPM), Tauri GUI.
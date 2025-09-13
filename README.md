### DragonLock

Local-first, offline CLI password vault for developers.

### Install

```sh
# from source
npm install
npm run build

# run without install
npx dragonlock --help
```

### Quickstart

```sh
# Initialize a new vault (prompts for master password)
dragonlock init

# Add a credential (prompts for fields)
dragonlock add

# List services
dragonlock list

# Get a credential (prints or copies to clipboard)
dragonlock get <service> [--copy] [--ttl 30]

# Delete all entries for a service
dragonlock delete <service>

# Wipe the vault (requires confirmation)
dragonlock wipe

# Generate a strong password
dragonlock generate [length] [--alphabet base64url|ascii|alnum|alnum-symbols|hex|numeric]
```

### Flags

- `--vault <path>`: Override default vault location
- `--json`: Machine-readable output where applicable

### Vault location (default)

- macOS/Linux: `~/.config/dragonlock/dragonlock.vault.json`
- Windows: `%APPDATA%\dragonlock\dragonlock.vault.json`

### Security model

- AES-256-GCM encryption; entire vault content is encrypted
- KDF: `argon2id` (preferred) with fallback to `scrypt` if `argon2` module isn’t available
- New random salt and IV per save; integrity via GCM tag
- Clipboard: `--copy` optionally writes password; `--ttl` best-effort auto-clear

### Notes & limitations

- Single-user; no sync/sharing
- No browser autofill
- Clipboard can leak; use `--ttl` to minimize exposure
- Argon2 is preferred but optional; performance varies by machine

### Development

```sh
npm install
npm run build
npm test
npm run dev   # tsx runner
```

### License

MIT 
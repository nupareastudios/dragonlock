### src/cli/commands/add.ts

Command: `dragonlock add`
- Prompts for master password (decrypt key).
- Loads encrypted vault; prompts entry fields.
- If password left blank, auto-generates via `generatePassword()`.
- Calls `vault.addEntry(...)` then `vault.saveEncrypted(master)`.
- In `--json` mode prints `{ ok: true }`. 
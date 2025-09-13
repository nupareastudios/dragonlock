### src/cli/commands/init.ts

Command: `dragonlock init`
- Resolves target vault path (or `--vault`).
- Aborts if file exists.
- Prompts for master password twice.
- Calls `Vault.initEncrypted(path, master)`.
- Outputs success/failure messages; sets non-zero exit code on error. 
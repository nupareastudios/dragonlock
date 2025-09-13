### src/cli/commands/get.ts

Command: `dragonlock get <service> [--copy] [--ttl <seconds>]`
- Prompts for master password; loads encrypted vault.
- Finds entries by service (case-insensitive).
- Behavior:
  - Multiple entries: prints a compact list with usernames and timestamps.
  - Single entry: prints notes and either shows password (default) or copies to clipboard.
- Clipboard:
  - `--copy` writes password; `--ttl` auto-clears after N seconds (best-effort).
- `--json` outputs raw entries array. 
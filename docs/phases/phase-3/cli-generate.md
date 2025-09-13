### src/cli/commands/generate.ts

Command: `dragonlock generate [length] [--alphabet <name>]`
- Generates a strong password.
- Supports alphabets: `base64url` (default), `ascii`, `alnum`, `alnum-symbols`, `hex`, `numeric`.
- In `--json` mode prints `{ password }`. 
### src/cli/index.ts

Exports:
- `createProgram(): Command`
  - Configures program name/description/version.
  - Adds global options: `--vault <path>`, `--json`.
  - Registers subcommands: `init`, `add`, `list`, `get`, `delete`, `wipe`, `generate`.
- `run(argv = process.argv): Promise<void>`
  - Builds program via `createProgram()` and `parseAsync(argv)`.

Notes:
- All commands read global options via `cmd.parent?.opts?.()`. 
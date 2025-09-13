### src/index.ts

- Shebang entry for CLI.
- Imports `run` from `src/cli/index.ts` and executes.
- On thrown error, logs and exits with non-zero code.

Key flow:
1. `run()`
2. If rejects → print error → `process.exit(1)`. 
### package.json

- **name/version/type**: ESM module, v0.1.0.
- **bin**: exposes the CLI as `dragonlock` → `dist/index.js`.
- **scripts**:
  - `build`: compile via `tsc`.
  - `dev`: `tsx src/index.ts` for fast TS execution.
  - `lint`, `test`, `format`: project hygiene.
- **dependencies**: runtime libs
  - `commander`: CLI framework
  - `env-paths`: OS app-data dirs
  - `inquirer`: interactive prompts
  - `clipboardy`: clipboard I/O
  - `uuid`: ids for entries
- **devDependencies**: tooling (TS, ESLint, Prettier, Vitest).
- **engines**: `node >= 18.18` (for modern crypto/APIs). 
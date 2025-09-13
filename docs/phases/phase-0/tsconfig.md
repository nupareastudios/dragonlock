### tsconfig.json

- `module`/`moduleResolution`: `NodeNext` for native ESM.
- `target`: ES2020 to match Node 18+.
- `rootDir` → `src`, `outDir` → `dist`.
- `strict`: enabled.
- `esModuleInterop`, `resolveJsonModule`, `skipLibCheck`, `sourceMap`: quality-of-life.
- `include`: `src` only (tests are not emitted in build). 
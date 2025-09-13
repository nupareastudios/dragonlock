### src/core/storage.ts

- `resolveVaultPath(overridePath?: string): string`
  - Uses `env-paths("dragonlock").config` to select default vault dir per OS.
  - If `overridePath` provided, resolves it.
- `ensureDirForFile(filePath: string): Promise<void>`
  - Creates parent directory recursively.
- `readFileSafe(filePath: string): Promise<Buffer | null>`
  - Reads file, returns `null` if `ENOENT`, else rethrows.
- `atomicWriteFile(filePath: string, data: Buffer | string): Promise<void>`
  - Writes to `filePath.tmp`, then renames into place to avoid corruption. 
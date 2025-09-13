import * as fs from "node:fs/promises";
import * as path from "node:path";
import envPaths from "env-paths";

export function resolveVaultPath(overridePath?: string): string {
  if (overridePath) return path.resolve(overridePath);
  const paths = envPaths("dragonlock");
  const dir = paths.config; // prefer config dir for user-editable settings
  return path.join(dir, "dragonlock.vault.json");
}

export async function ensureDirForFile(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readFileSafe(filePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    // @ts-expect-error - Node error typing
    if (error && error.code === "ENOENT") return null;
    throw error;
  }
}

export async function atomicWriteFile(filePath: string, data: Buffer | string): Promise<void> {
  await ensureDirForFile(filePath);
  const tmp = `${filePath}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, filePath);
} 
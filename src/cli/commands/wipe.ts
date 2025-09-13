import type { Command } from "commander";
import { resolveVaultPath } from "../../core/storage.js";
import * as fs from "node:fs/promises";
import { confirmWipe } from "../../ui/prompts.js";

export default function register(program: Command): void {
  program
    .command("wipe")
    .description("Wipe the entire vault (dangerous)")
    .action(async (_args, cmd: Command) => {
      const global = cmd.parent?.opts?.() ?? {};
      const vaultPath = resolveVaultPath(global.vault);
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      // eslint-disable-next-line no-console
      console.warn("⚠️ This will permanently delete your vault!");
      const ok = await confirmWipe(code);
      if (!ok) {
        // eslint-disable-next-line no-console
        console.log("Cancelled.");
        return;
      }
      try {
        await fs.unlink(vaultPath);
        // eslint-disable-next-line no-console
        console.log("🧹 Wiped.");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ ${(error as Error).message}`);
        process.exitCode = 1;
      }
    });
} 
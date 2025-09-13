import type { Command } from "commander";
import { resolveVaultPath, readFileSafe } from "../../core/storage.js";
import { Vault } from "../../core/vault.js";
import { askMasterPassword } from "../../ui/prompts.js";

export default function register(program: Command): void {
  program
    .command("init")
    .description("Initialize a new vault")
    .action(async (_args, cmd: Command) => {
      const global = cmd.parent?.opts?.() ?? {};
      const vaultPath = resolveVaultPath(global.vault);

      const existing = await readFileSafe(vaultPath);
      if (existing !== null) {
        // eslint-disable-next-line no-console
        console.error(`🗃️ Vault already exists at ${vaultPath}`);
        process.exitCode = 1;
        return;
      }

      try {
        const master = await askMasterPassword(true);
        await Vault.initEncrypted(vaultPath, master);
        // eslint-disable-next-line no-console
        console.log(`✅ Vault created at ${vaultPath}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ ${String((error as Error).message ?? error)}`);
        process.exitCode = 1;
      }
    });
} 
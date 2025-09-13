import type { Command } from "commander";
import { resolveVaultPath } from "../../core/storage.js";
import { Vault } from "../../core/vault.js";
import { askMasterPassword } from "../../ui/prompts.js";

export default function register(program: Command): void {
  program
    .command("list")
    .description("List services and usernames")
    .action(async (_args, cmd: Command) => {
      const global = cmd.parent?.opts?.() ?? {};
      const vaultPath = resolveVaultPath(global.vault);
      const master = await askMasterPassword(false);
      try {
        const vault = await Vault.loadEncrypted(vaultPath, master);
        const rows = vault.listServices();
        if (global.json) {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(rows));
          return;
        }
        // eslint-disable-next-line no-console
        console.log("🗂️  Services:");
        for (const r of rows) {
          // eslint-disable-next-line no-console
          console.log(`- ${r.service} (${r.username})`);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ ${(error as Error).message}`);
        process.exitCode = 1;
      }
    });
} 
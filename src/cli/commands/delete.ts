import type { Command } from "commander";
import { resolveVaultPath } from "../../core/storage.js";
import { Vault } from "../../core/vault.js";
import { askMasterPassword } from "../../ui/prompts.js";

export default function register(program: Command): void {
  program
    .command("delete")
    .argument("<service>", "service name")
    .description("Delete a credential")
    .action(async (service: string, _args, cmd: Command) => {
      const global = cmd.parent?.opts?.() ?? {};
      const vaultPath = resolveVaultPath(global.vault);
      const master = await askMasterPassword(false);
      try {
        const vault = await Vault.loadEncrypted(vaultPath, master);
        const removed = vault.deleteByService(service);
        await vault.saveEncrypted(master);
        if (removed === 0) {
          // eslint-disable-next-line no-console
          console.log(`ℹ️ Nothing to delete for '${service}'`);
        } else {
          // eslint-disable-next-line no-console
          console.log(`🗑️ Deleted ${removed} entr${removed === 1 ? "y" : "ies"} for '${service}'`);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ ${(error as Error).message}`);
        process.exitCode = 1;
      }
    });
} 
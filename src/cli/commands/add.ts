import type { Command } from "commander";
import { resolveVaultPath } from "../../core/storage.js";
import { Vault } from "../../core/vault.js";
import { askEntryFields, askMasterPassword } from "../../ui/prompts.js";
import { generatePassword } from "../../core/password.js";

export default function register(program: Command): void {
  program
    .command("add")
    .description("Add a credential")
    .action(async (_args, cmd: Command) => {
      const global = cmd.parent?.opts?.() ?? {};
      const vaultPath = resolveVaultPath(global.vault);
      const master = await askMasterPassword(false);
      try {
        const vault = await Vault.loadEncrypted(vaultPath, master);
        const { service, username, password, notes } = await askEntryFields();
        const finalPassword = password && password.length > 0 ? password : generatePassword();
        vault.addEntry({ service, username, password: finalPassword, notes });
        await vault.saveEncrypted(master);
        if (global.json) {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify({ ok: true }));
        } else {
          // eslint-disable-next-line no-console
          console.log("✅ Saved!");
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ ${(error as Error).message}`);
        process.exitCode = 1;
      }
    });
} 
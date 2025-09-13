import type { Command } from "commander";
import { resolveVaultPath } from "../../core/storage.js";
import { Vault } from "../../core/vault.js";
import { askMasterPassword } from "../../ui/prompts.js";
import clipboard from "clipboardy";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export default function register(program: Command): void {
  program
    .command("get")
    .argument("<service>", "service name")
    .option("--copy", "copy password to clipboard")
    .option("--ttl <seconds>", "auto-clear clipboard after N seconds", (v) => Number(v), 0)
    .description("Get a credential")
    .action(async (service: string, _options: { copy?: boolean; ttl?: number }, cmd: Command) => {
      const global = cmd.parent?.opts?.() ?? {};
      const opts = cmd.opts<{ copy?: boolean; ttl?: number }>();
      const vaultPath = resolveVaultPath(global.vault);
      const master = await askMasterPassword(false);
      try {
        const vault = await Vault.loadEncrypted(vaultPath, master);
        const entries = vault.findEntriesByService(service);
        if (entries.length === 0) {
          // eslint-disable-next-line no-console
          console.error(`❌ Not found: ${service}`);
          process.exitCode = 1;
          return;
        }
        if (global.json) {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(entries));
          return;
        }
        if (entries.length > 1) {
          // eslint-disable-next-line no-console
          console.log(`🔍 ${service} (${entries.length} entries)`);
          for (const e of entries) {
            // eslint-disable-next-line no-console
            console.log(`- ${e.username}  updated: ${e.updatedAt}`);
          }
        } else {
          const e = entries[0];
          // eslint-disable-next-line no-console
          console.log(`🔍 ${e.service} / ${e.username}`);
          // eslint-disable-next-line no-console
          console.log(`📝 Notes: ${e.notes ?? ""}`);
          if (opts.copy) {
            await clipboard.write(e.password);
            // eslint-disable-next-line no-console
            console.log(
              opts.ttl && opts.ttl > 0
                ? `🔑 Password copied to clipboard (auto-clears in ${opts.ttl}s)`
                : "🔑 Password copied to clipboard",
            );
            if (opts.ttl && opts.ttl > 0) {
              const ttlMs = Math.max(0, Math.floor(opts.ttl)) * 1000;
              void (async () => {
                await delay(ttlMs);
                try {
                  await clipboard.write("");
                } catch {}
              })();
            }
          } else {
            // eslint-disable-next-line no-console
            console.log(`🔑 Password: ${e.password}`);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`❌ ${(error as Error).message}`);
        process.exitCode = 1;
      }
    });
} 
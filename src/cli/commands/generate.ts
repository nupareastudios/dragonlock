import type { Command } from "commander";
import { generatePassword, type PasswordAlphabet } from "../../core/password.js";

export default function register(program: Command): void {
  program
    .command("generate")
    .argument("[length]", "length", (v) => Number(v), 20)
    .option(
      "--alphabet <name>",
      "one of: base64url, ascii, alnum, alnum-symbols, hex, numeric",
      "base64url",
    )
    .description("Generate a strong random password")
    .action(async (length: number, _args, cmd: Command) => {
      const global = cmd.parent?.opts?.() ?? {};
      const { alphabet } = cmd.opts<{ alphabet: PasswordAlphabet }>();
      const pw = generatePassword(length, alphabet);
      if (global.json) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({ password: pw }));
      } else {
        // eslint-disable-next-line no-console
        console.log(pw);
      }
    });
} 
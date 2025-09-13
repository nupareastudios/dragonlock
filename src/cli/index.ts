import { Command } from "commander";
import registerInit from "./commands/init.js";
import registerAdd from "./commands/add.js";
import registerList from "./commands/list.js";
import registerGet from "./commands/get.js";
import registerDelete from "./commands/delete.js";
import registerWipe from "./commands/wipe.js";
import registerGenerate from "./commands/generate.js";

export async function createProgram(): Promise<Command> {
  const program = new Command();

  program
    .name("dragonlock")
    .description("Local-first, offline CLI password vault for developers")
    .version("0.1.0")
    .option("--vault <path>", "override vault path")
    .option("--json", "machine-readable output", false);

  registerInit(program);
  registerAdd(program);
  registerList(program);
  registerGet(program);
  registerDelete(program);
  registerWipe(program);
  registerGenerate(program);

  return program;
}

export async function run(argv: readonly string[] = process.argv): Promise<void> {
  const program = await createProgram();
  await program.parseAsync(argv);
} 
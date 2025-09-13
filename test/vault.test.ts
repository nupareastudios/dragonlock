import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { Vault } from "../src/core/vault.js";

function randomTmpFile(): string {
  const id = Math.random().toString(36).slice(2);
  return path.join(os.tmpdir(), `dragonlock-test-${id}.json`);
}

describe("Vault plaintext CRUD", () => {
  let filePath: string;

  beforeEach(async () => {
    filePath = randomTmpFile();
    try {
      await fs.unlink(filePath);
    } catch {}
  });

  afterEach(async () => {
    try {
      await fs.unlink(filePath);
    } catch {}
  });

  it("creates, saves, reloads, and deletes entries", async () => {
    const vault = Vault.createNew(filePath);
    const created = vault.addEntry({
      service: "github",
      username: "ony",
      password: "supersecret",
    });
    expect(created.service).toBe("github");
    expect(vault.findEntriesByService("GitHub")).toHaveLength(1);

    await vault.savePlaintext();

    const reloaded = await Vault.loadPlaintext(filePath);
    expect(reloaded.getAllEntries()).toHaveLength(1);

    const removed = reloaded.deleteByService("github");
    expect(removed).toBe(1);
    expect(reloaded.getAllEntries()).toHaveLength(0);

    await reloaded.savePlaintext();

    const again = await Vault.loadPlaintext(filePath);
    expect(again.getAllEntries()).toHaveLength(0);
  });
}); 
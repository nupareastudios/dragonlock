import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { Vault } from "../src/core/vault.js";

function tmpFile(): string {
  const id = Math.random().toString(36).slice(2);
  return path.join(os.tmpdir(), `dragonlock-encrypted-${id}.vault.json`);
}

describe("Vault encrypted", () => {
  let filePath: string;

  beforeEach(async () => {
    filePath = tmpFile();
    try {
      await fs.unlink(filePath);
    } catch {}
  });

  afterEach(async () => {
    try {
      await fs.unlink(filePath);
    } catch {}
  });

  it("init, save, load with correct password", async () => {
    const master = "P@ssword-1234";
    const vault = await Vault.initEncrypted(filePath, master);
    vault.addEntry({ service: "github", username: "ony", password: "abc" });
    await vault.saveEncrypted(master);

    const reloaded = await Vault.loadEncrypted(filePath, master);
    const entries = reloaded.findEntriesByService("github");
    expect(entries).toHaveLength(1);
    expect(entries[0].username).toBe("ony");
  });

  it("throws on wrong password", async () => {
    const master = "right-password";
    const vault = await Vault.initEncrypted(filePath, master);
    vault.addEntry({ service: "aws", username: "me", password: "secret" });
    await vault.saveEncrypted(master);

    await expect(() => Vault.loadEncrypted(filePath, "wrong-password"))
      .rejects.toThrowError();
  });
}); 
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { Vault } from "../src/core/vault.js";

function tmpFile(): string {
  const id = Math.random().toString(36).slice(2);
  return path.join(os.tmpdir(), `dragonlock-dupes-${id}.json`);
}

describe("Vault duplicates", () => {
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

  it("allows multiple entries for same service", async () => {
    const v = Vault.createNew(filePath);
    v.addEntry({ service: "github", username: "main", password: "1" });
    v.addEntry({ service: "GitHub", username: "work", password: "2" });
    const found = v.findEntriesByService("github");
    expect(found.map((e) => e.username).sort()).toEqual(["main", "work"]);
  });

  it("deleteByService removes all entries for that service (case-insensitive)", async () => {
    const v = Vault.createNew(filePath);
    v.addEntry({ service: "github", username: "main", password: "1" });
    v.addEntry({ service: "GitHub", username: "work", password: "2" });
    const removed = v.deleteByService("GITHUB");
    expect(removed).toBe(2);
    expect(v.getAllEntries()).toHaveLength(0);
  });
}); 
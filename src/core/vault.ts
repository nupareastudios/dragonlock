import { v4 as uuidv4 } from "uuid";
import { atomicWriteFile, readFileSafe } from "./storage.js";
import type { VaultData, VaultEntry, EncryptedVault, KdfType } from "./models.js";
import { decodeBase64, encodeBase64 } from "./models.js";
import { deriveKey, deriveKeyFor, encryptAesGcm, decryptAesGcm } from "./crypto.js";
import { generateSalt } from "./crypto.js";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeServiceName(service: string): string {
  return service.trim().toLowerCase();
}

function assertNonEmpty(name: string, value: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} must not be empty`);
  }
}

export class Vault {
  private data: VaultData;
  private readonly filePath: string;

  private constructor(filePath: string, data: VaultData) {
    this.filePath = filePath;
    this.data = data;
  }

  static createNew(filePath: string): Vault {
    const timestamp = nowIso();
    const empty: VaultData = { createdAt: timestamp, updatedAt: timestamp, entries: [] };
    return new Vault(filePath, empty);
  }

  static async loadPlaintext(filePath: string): Promise<Vault> {
    const buf = await readFileSafe(filePath);
    if (buf === null) {
      return Vault.createNew(filePath);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(buf.toString("utf8"));
    } catch (error) {
      throw new Error(`Failed to parse vault file as JSON: ${(error as Error).message}`);
    }
    const data = parsed as Partial<VaultData>;
    if (!data || !Array.isArray(data.entries)) {
      throw new Error("Vault file format not recognized (expected plaintext VaultData)");
    }
    return new Vault(filePath, data as VaultData);
  }

  async savePlaintext(): Promise<void> {
    this.data.updatedAt = nowIso();
    const json = JSON.stringify(this.data, null, 2);
    await atomicWriteFile(this.filePath, Buffer.from(json, "utf8"));
  }

  static async initEncrypted(filePath: string, masterPassword: string): Promise<Vault> {
    const vault = Vault.createNew(filePath);
    await vault.saveEncrypted(masterPassword);
    return vault;
  }

  static async loadEncrypted(filePath: string, masterPassword: string): Promise<Vault> {
    const buf = await readFileSafe(filePath);
    if (buf === null) {
      throw new Error("Vault not initialized");
    }
    let container: EncryptedVault;
    try {
      container = JSON.parse(buf.toString("utf8"));
    } catch (error) {
      throw new Error(`Failed to parse encrypted vault: ${(error as Error).message}`);
    }
    if (container.version !== 1) throw new Error("Unsupported vault version");

    const salt = decodeBase64(container.salt);
    const iv = decodeBase64(container.iv);
    const tag = decodeBase64(container.tag);
    const ciphertext = decodeBase64(container.blob);

    const key = await deriveKeyFor(masterPassword, salt, container.kdf as KdfType);

    let plaintext: Buffer;
    try {
      plaintext = decryptAesGcm(ciphertext, key, iv, tag);
    } catch (error) {
      throw new Error("Wrong master password or corrupted vault");
    }

    let data: VaultData;
    try {
      data = JSON.parse(plaintext.toString("utf8"));
    } catch (error) {
      throw new Error("Decrypted data is not valid JSON");
    }
    return new Vault(filePath, data);
  }

  async saveEncrypted(masterPassword: string): Promise<void> {
    this.data.updatedAt = nowIso();
    const plaintext = Buffer.from(JSON.stringify(this.data), "utf8");

    const { key, kdf, salt } = await deriveKey(masterPassword, generateSalt(16));
    const { iv, ciphertext, tag } = encryptAesGcm(plaintext, key);

    const container: EncryptedVault = {
      version: 1,
      kdf,
      salt: encodeBase64(salt),
      cipher: "aes-256-gcm",
      iv: encodeBase64(iv),
      tag: encodeBase64(tag),
      blob: encodeBase64(ciphertext),
    };

    const json = JSON.stringify(container, null, 2);
    await atomicWriteFile(this.filePath, Buffer.from(json, "utf8"));
  }

  getAllEntries(): readonly VaultEntry[] {
    return this.data.entries.slice();
  }

  listServices(): Array<{ service: string; username: string; updatedAt: string }> {
    return this.data.entries
      .map((e) => ({ service: e.service, username: e.username, updatedAt: e.updatedAt }))
      .sort((a, b) => a.service.localeCompare(b.service) || a.username.localeCompare(b.username));
  }

  findEntriesByService(service: string): VaultEntry[] {
    const key = normalizeServiceName(service);
    return this.data.entries.filter((e) => normalizeServiceName(e.service) === key);
  }

  addEntry(input: {
    service: string;
    username: string;
    password: string;
    notes?: string;
  }): VaultEntry {
    assertNonEmpty("service", input.service);
    assertNonEmpty("username", input.username);
    const timestamp = nowIso();
    const entry: VaultEntry = {
      id: uuidv4(),
      service: input.service.trim(),
      username: input.username.trim(),
      password: input.password ?? "",
      notes: input.notes ?? "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.data.entries.push(entry);
    this.data.updatedAt = timestamp;
    return entry;
  }

  deleteByService(service: string): number {
    const key = normalizeServiceName(service);
    const before = this.data.entries.length;
    this.data.entries = this.data.entries.filter(
      (e) => normalizeServiceName(e.service) !== key,
    );
    const removed = before - this.data.entries.length;
    if (removed > 0) this.data.updatedAt = nowIso();
    return removed;
  }

  updateEntry(id: string, updates: Partial<Pick<VaultEntry, "username" | "password" | "notes">>): boolean {
    const idx = this.data.entries.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    const current = this.data.entries[idx];
    const next: VaultEntry = {
      ...current,
      username: updates.username !== undefined ? updates.username : current.username,
      password: updates.password !== undefined ? updates.password : current.password,
      notes: updates.notes !== undefined ? updates.notes : current.notes,
      updatedAt: nowIso(),
    };
    this.data.entries[idx] = next;
    this.data.updatedAt = next.updatedAt;
    return true;
  }

  toJSON(): VaultData {
    return JSON.parse(JSON.stringify(this.data));
  }
} 
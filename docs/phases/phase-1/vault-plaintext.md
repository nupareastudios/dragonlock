### src/core/vault.ts (plaintext CRUD)

Methods:
- `static createNew(filePath: string): Vault`
  - Builds empty `VaultData` with timestamps.
- `static loadPlaintext(filePath: string): Promise<Vault>`
  - Reads JSON file if present; if missing returns empty vault.
  - Validates shape minimally (must have `entries`).
- `savePlaintext(): Promise<void>`
  - Updates `updatedAt`, writes pretty JSON via `atomicWriteFile`.
- `getAllEntries(): VaultEntry[]`
  - Returns a shallow copy of all entries.
- `listServices(): { service, username, updatedAt }[]`
  - Maps entries for non-secret listing; sorted by service, then username.
- `findEntriesByService(service: string): VaultEntry[]`
  - Case-insensitive match by normalized service key.
- `addEntry({ service, username, password, notes }): VaultEntry`
  - Validates `service` and `username` non-empty.
  - Assigns `id` (uuid), trims strings, sets timestamps; pushes to entries.
- `deleteByService(service: string): number`
  - Removes all entries matching service (case-insensitive); returns removed count.
- `updateEntry(id: string, updates): boolean`
  - Partially updates `username|password|notes` by id; updates timestamps.
- `toJSON(): VaultData`
  - Deep-cloned JSON snapshot of internal data.

Implementation details:
- Normalization: `service.trim().toLowerCase()` for matching.
- Timestamps in ISO; maintained at vault and entry level. 
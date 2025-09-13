### src/ui/prompts.ts

- `askMasterPassword(confirm?: boolean): Promise<string>`
  - Masked password input; optional confirmation step; enforces min length.
- `askEntryFields(): Promise<{ service, username, password, notes }>`
  - Collects credential fields; password may be empty (auto-generate later).
- `confirmWipe(code: string): Promise<boolean>`
  - Asks user to type a verification code for dangerous wipe.

Validation:
- `req(v: string)` ensures non-empty strings for service/username. 
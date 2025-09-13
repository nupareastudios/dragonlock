### src/cli/commands/delete.ts

Command: `dragonlock delete <service>`
- Prompts for master password; loads encrypted vault.
- Removes all entries for the service; saves encrypted.
- Prints how many entries were removed. 
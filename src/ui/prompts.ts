import inquirer from "inquirer";

export async function askMasterPassword(confirm = false): Promise<string> {
  const { pw1 } = await inquirer.prompt<{ pw1: string }>([
    {
      type: "password",
      name: "pw1",
      message: confirm ? "🔐 Create master password:" : "🔐 Enter Master password:",
      mask: "*",
      validate: (v: string) => (v && v.length >= 8 ? true : "Use at least 8 characters"),
    },
  ]);
  if (!confirm) return pw1;
  const { pw2 } = await inquirer.prompt<{ pw2: string }>([
    { type: "password", name: "pw2", message: "🔐 Confirm master password:", mask: "*" },
  ]);
  if (pw1 !== pw2) {
    throw new Error("Passwords do not match");
  }
  return pw1;
}

export async function askEntryFields(): Promise<{
  service: string;
  username: string;
  password: string;
  notes: string;
}> {
  const answers = await inquirer.prompt<{
    service: string;
    username: string;
    password: string;
    notes: string;
  }>([
    { type: "input", name: "service", message: "🗝️ Service:", validate: req },
    { type: "input", name: "username", message: "👤 Username:", validate: req },
    { type: "password", name: "password", message: "🔒 Password (leave blank to auto-generate):", mask: "*" },
    { type: "input", name: "notes", message: "📝 Notes:", default: "" },
  ]);
  return answers;
}

export async function confirmWipe(code: string): Promise<boolean> {
  const { input } = await inquirer.prompt<{ input: string }>([
    {
      type: "input",
      name: "input",
      message: `Type '${code}' to confirm wipe:`,
    },
  ]);
  return input === code;
}

function req(v: string): true | string {
  return v && v.trim().length > 0 ? true : "Required";
} 
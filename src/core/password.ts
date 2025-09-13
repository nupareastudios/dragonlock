import { randomBytes } from "node:crypto";

export type PasswordAlphabet =
  | "base64url"
  | "ascii"
  | "alnum"
  | "alnum-symbols"
  | "hex"
  | "numeric";

const ALPHABETS: Record<PasswordAlphabet, string> = {
  base64url: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  ascii: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!@#$%^&*()[]{}<>?,.:;~",
  alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  "alnum-symbols": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_!@#$%^&*()[]{}",
  hex: "0123456789abcdef",
  numeric: "0123456789",
};

export function generatePassword(length = 20, alphabet: PasswordAlphabet = "base64url"): string {
  const alphabetStr = ALPHABETS[alphabet] ?? ALPHABETS.base64url;
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const idx = bytes[i] % alphabetStr.length;
    result += alphabetStr[idx];
  }
  return result;
} 
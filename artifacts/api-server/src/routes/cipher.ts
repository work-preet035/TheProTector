import { Router } from "express";
import { randomUUID } from "crypto";
import {
  CaesarCipherBody,
  VigenereCipherBody,
  Base64CipherBody,
  Rot13CipherBody,
  AtbashCipherBody,
  AnalyzeTextBody,
} from "@workspace/api-zod";

const router = Router();

interface HistoryItem {
  id: string;
  algorithm: string;
  mode: string;
  input: string;
  output: string;
  timestamp: string;
}

const history: HistoryItem[] = [];
const MAX_HISTORY = 100;

function addToHistory(item: Omit<HistoryItem, "id" | "timestamp">) {
  const entry: HistoryItem = {
    id: randomUUID(),
    ...item,
    timestamp: new Date().toISOString(),
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  return entry;
}

function caesarShift(text: string, shift: number, decrypt: boolean): string {
  const s = decrypt ? (26 - (shift % 26)) % 26 : shift % 26;
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + s) % 26) + 97);
      }
      if (/[A-Z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + s) % 26) + 65);
      }
      return char;
    })
    .join("");
}

function rot13(text: string): string {
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + 13) % 26) + 97);
      }
      if (/[A-Z]/.test(char)) {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + 13) % 26) + 65);
      }
      return char;
    })
    .join("");
}

function vigenere(text: string, key: string, decrypt: boolean): string {
  const cleanKey = key.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanKey) return text;
  let keyIdx = 0;
  return text
    .split("")
    .map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        const isUpper = char === char.toUpperCase();
        const base = isUpper ? 65 : 97;
        const k = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 97;
        const c = char.charCodeAt(0) - base;
        const shifted = decrypt
          ? ((c - k + 26) % 26) + base
          : ((c + k) % 26) + base;
        keyIdx++;
        return String.fromCharCode(shifted);
      }
      return char;
    })
    .join("");
}

function atbash(text: string): string {
  return text
    .split("")
    .map((char) => {
      if (/[a-z]/.test(char)) {
        return String.fromCharCode(97 + (25 - (char.charCodeAt(0) - 97)));
      }
      if (/[A-Z]/.test(char)) {
        return String.fromCharCode(65 + (25 - (char.charCodeAt(0) - 65)));
      }
      return char;
    })
    .join("");
}

router.post("/cipher/caesar", (req, res) => {
  const parsed = CaesarCipherBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { text, shift, mode } = parsed.data;
  const output = caesarShift(text, shift, mode === "decrypt");
  const result = {
    input: text,
    output,
    algorithm: "caesar",
    mode,
    timestamp: new Date().toISOString(),
  };
  addToHistory({ input: text, output, algorithm: "Caesar Cipher", mode });
  res.json(result);
});

router.post("/cipher/rot13", (req, res) => {
  const parsed = Rot13CipherBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { text } = parsed.data;
  const output = rot13(text);
  const result = {
    input: text,
    output,
    algorithm: "rot13",
    mode: "encode/decode",
    timestamp: new Date().toISOString(),
  };
  addToHistory({ input: text, output, algorithm: "ROT13", mode: "encode/decode" });
  res.json(result);
});

router.post("/cipher/vigenere", (req, res) => {
  const parsed = VigenereCipherBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { text, key, mode } = parsed.data;
  if (!key || key.trim().length === 0) {
    res.status(400).json({ error: "invalid_key", message: "Key must contain at least one alphabetic character." });
    return;
  }
  const output = vigenere(text, key, mode === "decrypt");
  const result = {
    input: text,
    output,
    algorithm: "vigenere",
    mode,
    timestamp: new Date().toISOString(),
  };
  addToHistory({ input: text, output, algorithm: "Vigenère Cipher", mode });
  res.json(result);
});

router.post("/cipher/base64", (req, res) => {
  const parsed = Base64CipherBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { text, mode } = parsed.data;
  let output: string;
  try {
    output =
      mode === "encode"
        ? Buffer.from(text, "utf8").toString("base64")
        : Buffer.from(text, "base64").toString("utf8");
  } catch {
    res.status(400).json({ error: "decode_error", message: "Invalid Base64 input." });
    return;
  }
  const result = {
    input: text,
    output,
    algorithm: "base64",
    mode,
    timestamp: new Date().toISOString(),
  };
  addToHistory({ input: text, output, algorithm: "Base64", mode });
  res.json(result);
});

router.post("/cipher/atbash", (req, res) => {
  const parsed = AtbashCipherBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { text } = parsed.data;
  const output = atbash(text);
  const result = {
    input: text,
    output,
    algorithm: "atbash",
    mode: "encrypt/decrypt",
    timestamp: new Date().toISOString(),
  };
  addToHistory({ input: text, output, algorithm: "Atbash Cipher", mode: "encrypt/decrypt" });
  res.json(result);
});

router.post("/cipher/analyze", (req, res) => {
  const parsed = AnalyzeTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }
  const { text } = parsed.data;
  const counts: Record<string, number> = {};
  let alphabeticChars = 0;
  for (const char of text.toLowerCase()) {
    if (/[a-z]/.test(char)) {
      counts[char] = (counts[char] || 0) + 1;
      alphabeticChars++;
    }
  }
  const frequencies = Object.entries(counts)
    .map(([char, count]) => ({
      char,
      count,
      percentage: alphabeticChars > 0 ? Math.round((count / alphabeticChars) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const mostCommon = frequencies[0]?.char ?? "";
  const englishMostCommon = "e";
  const mostCommonCode = mostCommon ? mostCommon.charCodeAt(0) - 97 : 0;
  const englishCode = englishMostCommon.charCodeAt(0) - 97;
  const suggestedShift = mostCommon ? ((mostCommonCode - englishCode + 26) % 26) : 0;

  res.json({
    text,
    totalChars: text.length,
    alphabeticChars,
    frequencies,
    mostCommon,
    suggestedShift,
  });
});

router.get("/cipher/history", (_req, res) => {
  res.json({ items: history, total: history.length });
});

router.delete("/cipher/history", (_req, res) => {
  history.splice(0, history.length);
  res.json({ success: true, message: "History cleared." });
});

router.get("/cipher/stats", (_req, res) => {
  const byAlgorithm: Record<string, number> = {};
  const byMode: Record<string, number> = {};

  for (const item of history) {
    byAlgorithm[item.algorithm] = (byAlgorithm[item.algorithm] || 0) + 1;
    byMode[item.mode] = (byMode[item.mode] || 0) + 1;
  }

  const mostUsedAlgorithm =
    Object.entries(byAlgorithm).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";

  res.json({
    totalOperations: history.length,
    byAlgorithm,
    byMode,
    mostUsedAlgorithm,
  });
});

export default router;

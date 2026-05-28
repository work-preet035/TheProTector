# The ProTector

> A professional, full-stack cryptography toolkit — encrypt, decrypt, brute-force, and analyze messages using classical cipher algorithms through a sleek dark web interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)

---

## What is The ProTector?

The ProTector is a **professional full-stack cryptography web application** originally inspired by the WiZzryptic Python CLI Caesar Cipher tool. It has been rebuilt from the ground up with a modern React frontend, a typed Express API, and a contract-first OpenAPI architecture.

It brings classical cryptography to life with a cyberpunk terminal aesthetic, real-time cipher operations, brute-force cracking, operation history tracking, and letter frequency analysis.

**Supported algorithms:**

| Algorithm | Description |
|-----------|-------------|
| **Caesar Cipher** | Classic shift cipher with configurable shift (1–25) |
| **ROT-13** | Fixed Caesar shift of 13 — symmetric encode/decode |
| **Vigenère Cipher** | Polyalphabetic cipher using a repeating keyword |
| **Base64** | Standard binary-to-text encoding/decoding |
| **Atbash Cipher** | Mirrors the alphabet (A↔Z, B↔Y, ...) |
| **Brute Force Caesar** | Tries all 25 shifts, ranked by English readability |

---

## Features

- **Cipher Lab** — Encrypt and decrypt using all 5 algorithms from a unified interface
- **Brute Force Caesar** — One click: tries all 25 shifts and ranks results by how English they look
- **Frequency Analyzer** — Letter frequency bar chart vs. English average, plus suggested shift
- **Operation History** — Every cipher operation tracked in a scrollable timeline with algorithm badges
- **Usage Stats** — Real-time totals and most-used algorithm breakdown
- **Copy to Clipboard** — One-click copy on all outputs
- **Dark terminal aesthetic** — Neon green on near-black, monospace throughout

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite + TypeScript |
| **Styling** | Tailwind CSS v4 + Framer Motion |
| **State / Data** | TanStack React Query |
| **Backend** | Express 5 + Node.js 24 |
| **Validation** | Zod v4 |
| **API Contract** | OpenAPI 3.1 → Orval codegen |
| **Build** | esbuild (server) + Vite (client) |
| **Monorepo** | pnpm workspaces |

---

## Project Structure

```
the-protector/
├── artifacts/
│   ├── api-server/              # Express API server
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── cipher.ts    # All cipher algorithm implementations
│   │       │   └── health.ts
│   │       └── app.ts
│   └── wizzryptic/              # React + Vite frontend
│       └── src/
│           ├── pages/
│           │   ├── home.tsx     # Cipher Lab
│           │   ├── history.tsx  # Operation History + Stats
│           │   ├── analyze.tsx  # Frequency Analyzer + Brute Force
│           │   └── about.tsx    # Algorithm docs
│           ├── components/
│           │   └── layout.tsx   # Sidebar navigation
│           └── index.css        # Dark cyberpunk theme
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml         # OpenAPI spec (source of truth)
│   ├── api-client-react/        # Generated React Query hooks
│   └── api-zod/                 # Generated Zod validation schemas
├── README.md
├── LICENSE
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- [Node.js 24+](https://nodejs.org/)
- [pnpm 10+](https://pnpm.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/the-protector.git
cd the-protector

# Install all dependencies
pnpm install
```

### Run the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

### Run the Frontend

```bash
pnpm --filter @workspace/wizzryptic run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Full Typecheck

```bash
pnpm run typecheck
```

### Regenerate API Types (after editing the spec)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## API Reference

All endpoints are served under `/api`.

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/healthz` | — | Health check |
| `POST` | `/api/cipher/caesar` | `{ text, shift, mode }` | Caesar encrypt/decrypt |
| `POST` | `/api/cipher/rot13` | `{ text }` | ROT-13 encode/decode |
| `POST` | `/api/cipher/vigenere` | `{ text, key, mode }` | Vigenère encrypt/decrypt |
| `POST` | `/api/cipher/base64` | `{ text, mode }` | Base64 encode/decode |
| `POST` | `/api/cipher/atbash` | `{ text }` | Atbash encrypt/decrypt |
| `POST` | `/api/cipher/analyze` | `{ text }` | Frequency analysis |
| `GET` | `/api/cipher/history` | — | Get operation history |
| `DELETE` | `/api/cipher/history` | — | Clear history |
| `GET` | `/api/cipher/stats` | — | Usage statistics |

### Example

```bash
curl -X POST http://localhost:5000/api/cipher/caesar \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, World!", "shift": 13, "mode": "encrypt"}'
```

```json
{
  "input": "Hello, World!",
  "output": "Uryyb, Jbeyq!",
  "algorithm": "caesar",
  "mode": "encrypt",
  "timestamp": "2026-05-27T12:00:00.000Z"
}
```

---

## Brute Force Caesar

The brute-force feature (in Frequency Analyzer) tries all 25 possible Caesar shifts locally in the browser and ranks them using two signals:

1. **Common word matching** — rewards outputs containing frequent English words (the, and, is, etc.)
2. **Letter frequency matching** — penalizes deviation from standard English letter distribution

The best match is ranked #1 and highlighted. Copy any result directly to use in the Cipher Lab.

---

## Origin

This project is a professional reimagining of the original **WiZzryptic** Python CLI tool (Caesar Cipher only, terminal-based) developed as an internship project.

| Original WiZzryptic | The ProTector |
|---------------------|---------------|
| Python CLI (terminal only) | Full-stack web application |
| Caesar Cipher only | 6 cipher algorithms + brute force |
| No persistence | Live history + statistics |
| ASCII art banner | Dark cyberpunk UI + animations |
| `pyfiglet` + `colorama` | React 19 + Tailwind + Framer Motion |
| No API | Type-safe OpenAPI REST backend |
| 80 lines of Python | Production-grade TypeScript monorepo |

---

## Security Note

These are **classical ciphers** — they are educational and historically significant, but **not suitable for protecting real sensitive data**. Modern encryption standards (AES-256, RSA, etc.) are required for actual security. Use this tool to learn, explore, and have fun with cryptography.

---

## License

[MIT License](./LICENSE)

---

*Built with React, Express, TypeScript, and a healthy obsession with cryptography.*

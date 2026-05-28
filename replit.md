# WiZzryptic

A professional full-stack cryptography toolkit web app — encrypt, decrypt, and analyze text using classical cipher algorithms through a sleek dark-themed interface.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from $PORT)
- `pnpm --filter @workspace/wizzryptic run dev` — run the frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- No database required — history is in-memory per server session

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4 + Framer Motion
- API: Express 5
- State: TanStack React Query
- Validation: Zod (zod/v4), OpenAPI-first with Orval codegen
- Build: esbuild (server CJS bundle), Vite (client)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas for server validation
- `artifacts/api-server/src/routes/cipher.ts` — all cipher algorithm implementations
- `artifacts/wizzryptic/src/pages/` — frontend pages (home, history, analyze, about)
- `artifacts/wizzryptic/src/components/layout.tsx` — sidebar navigation layout
- `artifacts/wizzryptic/src/index.css` — dark cyberpunk theme tokens

## Architecture decisions

- Contract-first: OpenAPI spec drives both client types (React Query hooks) and server validation (Zod schemas) via Orval codegen
- History stored in-memory on the API server (no database needed for a cipher tool)
- Dark-only theme with neon green primary for hacker/terminal aesthetic
- All 5 cipher algorithms (Caesar, ROT13, Vigenère, Base64, Atbash) share a single unified API pattern

## Product

- **Cipher Lab** — Main page. Encrypt/decrypt using Caesar, ROT13, Vigenère, Base64, or Atbash. Tab/button selector switches algorithms; monospace output panel with copy-to-clipboard.
- **History** — Scrollable timeline of all cipher operations with algorithm color badges, in/out display, and copy buttons. Includes real-time usage stats.
- **Frequency Analyzer** — Paste ciphertext to get a letter frequency bar chart (Recharts), most common letter, and suggested Caesar shift based on English frequency tables.
- **About** — Algorithm descriptions and project info.

## User preferences

_Populate as you build._

## Gotchas

- Re-run codegen (`pnpm --filter @workspace/api-spec run codegen`) after any change to `lib/api-spec/openapi.yaml`
- History is in-memory — it resets when the API server restarts
- The frontend uses `import.meta.env.BASE_URL` for routing — do not hardcode paths

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- GitHub-ready: `README.md` and `.gitignore` are at the repo root

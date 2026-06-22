# Penerjemah Istilah Teknik

A small, fast web app that translates Indonesian civil / structural /
architectural **construction terms** into the English terminology that
practicing engineers actually use — on drawings, specifications, BoQ, and on
site. It returns the **answer only**, with no explanation.

- **Glossary-first** — input is normalized and looked up in a local
  `glossary.json`. Hits return instantly (offline, zero latency, zero cost).
- **LLM fallback** — anything not in the glossary is sent to `POST /api/translate`,
  a minimal backend that holds the API key and calls the LLM. The key never
  reaches the client bundle.
- **Casing rule** — ALL CAPS sheet titles stay ALL CAPS; lowercase input stays
  lowercase; otherwise the canonical case is kept.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Express proxy (`server/index.js`) exposing `POST /api/translate`
- LLM provider: configurable via `.env` — Anthropic Claude `claude-sonnet-4-6`
  (default) or Groq (`GROQ_API_KEY`)

## Setup

```bash
npm install
cp .env.example .env   # then fill in your key(s)
```

Edit `.env`:

```
LLM_PROVIDER=anthropic        # or "groq"
ANTHROPIC_API_KEY=sk-ant-...  # required when provider is anthropic
GROQ_API_KEY=gsk_...          # required when provider is groq
```

## Develop

```bash
npm run dev
```

This runs the Vite dev server (http://localhost:5173) and the API proxy
(http://localhost:3001) together. Vite proxies `/api` to the backend.

## Production

```bash
npm run build   # builds the frontend into dist/
npm start       # Express serves dist/ AND the /api endpoint on $PORT
```

## How the API key stays server-side

The key is read from `.env` by `server/index.js` only. The React app calls the
relative path `/api/translate` and never imports the key. After `npm run build`
you can confirm it is absent from the bundle:

```bash
grep -r "ANTHROPIC_API_KEY\|sk-ant-\|GROQ_API_KEY" dist/   # → no matches
```

## Growing the glossary

Use **"Simpan ke glossary"** on any history row to append a confirmed result to
your local glossary (stored in `localStorage`), so it resolves instantly next
time. To bake a term into the shipped app, add it to `src/lib/glossary.json`.

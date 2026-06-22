import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { translateTerm, getProvider } from './translate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const app = express();
app.use(express.json({ limit: '32kb' }));

const PORT = process.env.PORT || 3001;

// --- API -------------------------------------------------------------------
// Mirrors the Vercel serverless function (api/translate.js). The shared logic
// lives in server/translate.js; the API key stays server-side.

app.post('/api/translate', async (req, res) => {
  try {
    const { term, domain = 'umum', us = false } = req.body || {};
    if (!term || typeof term !== 'string' || !term.trim()) {
      return res.status(400).json({ error: 'Missing term' });
    }

    const result = await translateTerm({ term: term.trim(), domain, us });
    if (!result) return res.status(502).json({ error: 'Empty result' });
    return res.json({ result });
  } catch (err) {
    console.error('[translate] error:', err.message);
    return res.status(500).json({ error: 'Translation failed' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, provider: getProvider() });
});

// --- Static (self-hosting / production) ------------------------------------
// When self-hosting (npm start), serve the built frontend from the same server.
// On Vercel this file is NOT used; the static build + api/translate.js are.
const distDir = path.join(ROOT, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`API proxy listening on http://localhost:${PORT} (provider: ${getProvider()})`);
});

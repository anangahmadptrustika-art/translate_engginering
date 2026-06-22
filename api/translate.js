// Vercel serverless function: POST /api/translate
// The LLM API key is read from Vercel Environment Variables (server-side only)
// and never reaches the client bundle. Shared logic lives in server/translate.js.
import { translateTerm } from '../server/translate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel parses JSON bodies automatically, but be defensive.
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const { term, domain = 'umum', us = false } = body || {};
    if (!term || typeof term !== 'string' || !term.trim()) {
      return res.status(400).json({ error: 'Missing term' });
    }

    const result = await translateTerm({ term: term.trim(), domain, us });
    if (!result) return res.status(502).json({ error: 'Empty result' });
    return res.status(200).json({ result });
  } catch (err) {
    console.error('[translate] error:', err.message);
    return res.status(500).json({ error: 'Translation failed' });
  }
}

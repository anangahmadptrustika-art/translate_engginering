// Shared translation logic used by BOTH the local Express dev server
// (server/index.js) and the Vercel serverless function (api/translate.js).
// It reads the provider + API key from environment variables only.

// --- System prompt ---------------------------------------------------------
// The base prompt is used VERBATIM. Only the convention line is swapped when
// the US toggle is on; a domain hint is appended without changing the format.

const UK_CONVENTION_LINE =
  '- Use international / British engineering convention by default (e.g. "ground floor", "rebar", "formwork", "screed", "kerb", "carriageway", "setting-out", "centreline"). Use a US term only if it is clearly the more standard international usage.';

const US_CONVENTION_LINE =
  '- Use US engineering convention by default (e.g. "first floor" for ground, "curb", "rebar", "centerline"). Use an international / British term only if it is clearly the more standard usage.';

const DOMAIN_HINTS = {
  struktur: 'Structural engineering',
  arsitektur: 'Architecture',
  sipil: 'Civil engineering / roadworks',
  umum: null,
};

export function getProvider() {
  return (process.env.LLM_PROVIDER || 'anthropic').toLowerCase();
}

export function buildSystemPrompt({ us = false, domain = 'umum' } = {}) {
  const conventionLine = us ? US_CONVENTION_LINE : UK_CONVENTION_LINE;
  let prompt = `You are a senior civil / structural / architectural engineer and a specialist in Indonesian→English construction terminology.

Translate the Indonesian engineering/construction term or phrase into the English term that practicing engineers actually use on drawings, specifications, bills of quantities, and on site — NOT a literal or dictionary translation.

Output rules:
- Output ONLY the English term. No explanation, no preamble, no quotation marks, no trailing period, no notes.
${conventionLine}
- If the term is genuinely ambiguous with 2-3 common construction meanings, output them separated by " / " (most common first), still with NO prose.
- If the input looks like a drawing sheet title or label in ALL CAPS, return the output in ALL CAPS.
- Keep standard engineering abbreviations (RC, RCC, BoQ, dia., c/c, FFL, SSL).`;

  const hint = DOMAIN_HINTS[domain];
  if (hint) {
    prompt += `\n\nDisambiguation context (use only to choose the right term; do NOT change the output format): the term comes from the field of ${hint}.`;
  }

  // Anti-literal steering: a few examples showing idiomatic engineering terms,
  // NOT word-for-word translation. Output format stays answer-only.
  prompt += `\n\nExamples (Indonesian -> the term engineers actually use; never word-for-word):
lantai dasar -> Ground floor
pekerjaan tanah -> Earthworks
dinding geser -> Shear wall
balok anak -> Secondary beam
kolom praktis -> Practical column
sloof -> Tie beam / Ground beam
pembesian -> Rebar work / Reinforcement`;

  return prompt;
}

// Defensive: enforce answer-only even if the model adds stray formatting.
export function sanitize(text) {
  if (!text) return '';
  let t = String(text).trim();
  // First non-empty line only.
  t = t.split(/\r?\n/).find((l) => l.trim().length) || '';
  t = t.trim();
  // Strip wrapping quotes.
  t = t.replace(/^["'“”‘’`]+/, '').replace(/["'“”‘’`]+$/, '');
  // Strip a single trailing period (but keep things like "No. 3" mid-string).
  t = t.replace(/\.\s*$/, '');
  return t.trim();
}

// --- Providers -------------------------------------------------------------

async function callAnthropic({ term, system }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 256,
      temperature: 0,
      system,
      messages: [{ role: 'user', content: term }],
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`Anthropic ${resp.status}: ${detail.slice(0, 300)}`);
  }
  const data = await resp.json();
  return data?.content?.[0]?.text || '';
}

async function callGroq({ term, system }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 256,
      temperature: 0,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: term },
      ],
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`Groq ${resp.status}: ${detail.slice(0, 300)}`);
  }
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

// Translate a single term. Returns the sanitized English term (answer only).
export async function translateTerm({ term, domain = 'umum', us = false }) {
  const system = buildSystemPrompt({ us: !!us, domain });
  const raw =
    getProvider() === 'groq'
      ? await callGroq({ term, system })
      : await callAnthropic({ term, system });
  return sanitize(raw);
}

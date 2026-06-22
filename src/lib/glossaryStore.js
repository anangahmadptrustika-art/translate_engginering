// Glossary lookup. The bundled seed glossary (glossary.json) is merged with a
// user-grown glossary kept in localStorage, so "Simpan ke glossary" makes a
// term resolve instantly (offline, zero latency, zero cost) next time.
import seed from './glossary.json';
import { normalizeKey } from './casing';

const LS_KEY = 'penerjemah_glossary_local_v1';

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

// Returns the stored (canonical-case) value, or null if not found.
// Local entries win over seed entries.
export function lookup(input) {
  const key = normalizeKey(input);
  if (!key) return null;
  const local = loadLocal();
  if (Object.prototype.hasOwnProperty.call(local, key)) return local[key];
  if (Object.prototype.hasOwnProperty.call(seed, key)) return seed[key];
  return null;
}

export function inGlossary(input) {
  return lookup(input) !== null;
}

// Append/overwrite a confirmed result in the local glossary.
export function saveToGlossary(input, value) {
  const key = normalizeKey(input);
  if (!key || !value) return;
  const local = loadLocal();
  local[key] = value;
  localStorage.setItem(LS_KEY, JSON.stringify(local));
}

// Casing helpers shared by the glossary and LLM paths.
//
// Glossary values are stored in normal/title case. On display we adapt the
// case to the input:
//   - ALL CAPS input that looks like a drawing sheet title/label -> ALL CAPS
//   - all-lowercase input -> lowercase
//   - otherwise -> keep the canonical (stored) case

export function normalizeKey(s) {
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
}

// True when the input is ALL CAPS (and contains at least 2 letters), i.e. it
// reads like a drawing sheet title or label such as "DENAH PERLETAKAN KUSEN".
export function isAllCapsLabel(s) {
  const t = String(s).trim();
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (letters.length < 2) return false;
  return t === t.toUpperCase() && t !== t.toLowerCase();
}

// True when the input has letters and they are all lowercase, e.g. "pembesian".
export function isAllLower(s) {
  const t = String(s).trim();
  if (!/[a-z]/.test(t)) return false;
  return t === t.toLowerCase() && t !== t.toUpperCase();
}

export function applyCasing(input, output) {
  if (!output) return output;
  if (isAllCapsLabel(input)) return output.toUpperCase();
  if (isAllLower(input)) return output.toLowerCase();
  return output;
}

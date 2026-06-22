// Recent translation history, persisted to localStorage.
const LS_KEY = 'penerjemah_history_v1';
const MAX = 50;

export function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, MAX)));
}

// Adds an entry to the top, de-duplicating by normalized input.
export function addHistory(entry) {
  const items = loadHistory();
  const key = entry.input.trim().toLowerCase();
  const filtered = items.filter((it) => it.input.trim().toLowerCase() !== key);
  const next = [{ ...entry, ts: Date.now() }, ...filtered].slice(0, MAX);
  persist(next);
  return next;
}

export function clearHistory() {
  localStorage.removeItem(LS_KEY);
  return [];
}

import { useEffect, useMemo, useState } from 'react';
import Toggles from './components/Toggles.jsx';
import Input from './components/Input.jsx';
import Result from './components/Result.jsx';
import History from './components/History.jsx';
import { applyCasing } from './lib/casing.js';
import { lookup, saveToGlossary, inGlossary } from './lib/glossaryStore.js';
import { loadHistory, addHistory, clearHistory } from './lib/historyStore.js';

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // { input, raw }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [domain, setDomain] = useState('umum');
  const [us, setUs] = useState(false);
  const [history, setHistory] = useState([]);
  // Bumped whenever the local glossary changes, to refresh "saved" badges.
  const [glossaryVersion, setGlossaryVersion] = useState(0);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const displayResult = useMemo(
    () => (result ? applyCasing(result.input, result.raw) : ''),
    [result]
  );

  async function translate() {
    const term = input.trim();
    if (!term || loading) return;
    setError(null);

    // 1) Glossary-first: instant, offline, zero cost.
    const hit = lookup(term);
    if (hit) {
      const entry = { input: term, raw: hit };
      setResult(entry);
      setHistory(addHistory(entry));
      return;
    }

    // 2) LLM fallback via the server proxy (key stays server-side).
    setLoading(true);
    try {
      const resp = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ term, domain, us }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.result) {
        throw new Error(data.error || 'Translation failed');
      }
      const entry = { input: term, raw: data.result };
      setResult(entry);
      setHistory(addHistory(entry));
    } catch (e) {
      setError('Gagal menerjemahkan. Periksa koneksi / konfigurasi server.');
    } finally {
      setLoading(false);
    }
  }

  function handleSave(entry) {
    saveToGlossary(entry.input, entry.raw);
    setGlossaryVersion((v) => v + 1);
  }

  function handleClear() {
    setHistory(clearHistory());
  }

  // glossaryVersion is referenced so the saved-badges recompute after a save.
  const isSaved = (term) => glossaryVersion >= 0 && inGlossary(term);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Penerjemah <span className="text-accent">Istilah Teknik</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Indonesia → Inggris untuk gambar, spesifikasi, BoQ &amp; lapangan.
        </p>
      </header>

      <Toggles domain={domain} onDomain={setDomain} us={us} onUs={setUs} />

      <Input
        value={input}
        onChange={setInput}
        onSubmit={translate}
        loading={loading}
      />

      <Result text={displayResult} loading={loading} error={error} />

      <History
        items={history}
        onSave={handleSave}
        onClear={handleClear}
        isSaved={isSaved}
      />

      <footer className="mt-auto pt-4 text-center text-xs text-zinc-600">
        Glossary-first · LLM fallback · jawaban-saja
      </footer>
    </div>
  );
}

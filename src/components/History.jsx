import CopyButton from './CopyButton.jsx';
import { applyCasing } from '../lib/casing.js';

// Recent history list. Each row is copyable (copies the translated term only)
// and offers "Simpan ke glossary".
export default function History({ items, onSave, onClear, isSaved }) {
  if (!items.length) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500">Riwayat</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Hapus riwayat
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {items.map((it) => {
          const display = applyCasing(it.input, it.raw);
          const saved = isSaved(it.input);
          return (
            <li
              key={it.ts + it.input}
              className="flex items-center justify-between gap-3 rounded-xl bg-zinc-900/70 px-4 py-3 ring-1 ring-zinc-800"
            >
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-500">{it.input}</p>
                <p className="truncate font-semibold text-zinc-100">{display}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSave(it)}
                  disabled={saved}
                  className={
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ' +
                    (saved
                      ? 'cursor-default bg-zinc-800 text-zinc-500'
                      : 'bg-accent/20 text-accent hover:bg-accent/30')
                  }
                >
                  {saved ? 'Di glossary ✓' : 'Simpan ke glossary'}
                </button>
                <CopyButton text={display} label="Salin" />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import CopyButton from './CopyButton.jsx';

// The result area shows ONLY the translated term + a Copy button.
// No definitions, usage notes, or examples — ever.
export default function Result({ text, loading, error }) {
  return (
    <div className="min-h-[120px] rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      {loading ? (
        <p className="text-lg text-zinc-500">Menerjemahkan…</p>
      ) : error ? (
        <p className="text-base text-red-400">{error}</p>
      ) : text ? (
        <div className="flex items-start justify-between gap-4">
          <p className="break-words text-3xl font-bold leading-tight text-accent sm:text-4xl">
            {text}
          </p>
          <CopyButton text={text} big label="Salin" className="shrink-0" />
        </div>
      ) : (
        <p className="text-lg text-zinc-600">Hasil terjemahan akan muncul di sini.</p>
      )}
    </div>
  );
}

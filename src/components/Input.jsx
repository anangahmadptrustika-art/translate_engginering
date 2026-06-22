// Large input textarea (supports paste) + translate button.
// Enter submits; Shift+Enter inserts a newline.

export default function Input({ value, onChange, onSubmit, loading }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        autoFocus
        spellCheck={false}
        placeholder="Ketik istilah teknik (mis. DENAH PERLETAKAN KUSEN)…"
        className="w-full resize-y rounded-2xl bg-zinc-900 px-4 py-3 text-lg text-zinc-100 placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-accent"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="rounded-2xl bg-accent px-5 py-3 text-base font-bold text-black transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? 'Menerjemahkan…' : 'Terjemahkan'}
      </button>
    </div>
  );
}

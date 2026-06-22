import { useState } from 'react';

// Copies ONLY the provided text. Shows a brief confirmation.
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyButton({ text, className = '', label = 'Salin', big = false }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  const base = big
    ? 'rounded-xl px-4 py-2 text-sm font-semibold'
    : 'rounded-lg px-2.5 py-1 text-xs font-semibold';

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${label} hasil`}
      className={
        base +
        ' transition-colors ' +
        (copied
          ? 'bg-emerald-500 text-black '
          : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 ') +
        className
      }
    >
      {copied ? 'Tersalin ✓' : label}
    </button>
  );
}

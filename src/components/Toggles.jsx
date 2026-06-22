// Domain disambiguation toggle + UK/US convention toggle.

const DOMAINS = [
  { value: 'umum', label: 'Umum' },
  { value: 'struktur', label: 'Struktur' },
  { value: 'arsitektur', label: 'Arsitektur' },
  { value: 'sipil', label: 'Sipil-Jalan' },
];

function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-xl bg-zinc-900 p-1 ring-1 ring-zinc-800"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ' +
              (active
                ? 'bg-accent text-black'
                : 'text-zinc-400 hover:text-zinc-100')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Toggles({ domain, onDomain, us, onUs }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Domain
        </span>
        <Segmented
          ariaLabel="Domain"
          options={DOMAINS}
          value={domain}
          onChange={onDomain}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Konvensi
        </span>
        <Segmented
          ariaLabel="Konvensi"
          options={[
            { value: 'uk', label: 'UK/International' },
            { value: 'us', label: 'US' },
          ]}
          value={us ? 'us' : 'uk'}
          onChange={(v) => onUs(v === 'us')}
        />
      </div>
    </div>
  );
}

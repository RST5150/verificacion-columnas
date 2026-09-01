interface Props {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}

const OPTIONS: { value: boolean | null; text: string; activeClass: string }[] = [
  { value: true, text: 'Sí', activeClass: 'bg-success-surface text-success' },
  { value: false, text: 'No', activeClass: 'bg-danger-surface text-danger' },
  { value: null, text: '—', activeClass: 'bg-surface-alt text-foreground/70' },
]

// Tres estados en vez de un switch binario: una inspección nueva también
// puede quedar sin ese dato relevado, no solo SI/NO.
export default function ToggleSwitch({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-fluent border border-border px-3 py-2 text-sm">
      <span className="text-foreground/80">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`min-w-[2.25rem] rounded-full px-2 py-1 text-xs font-semibold transition-colors ${
              value === opt.value ? opt.activeClass : 'text-foreground/40 hover:bg-surface-alt'
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  )
}

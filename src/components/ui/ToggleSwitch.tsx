interface Props {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export default function ToggleSwitch({ label, value, onChange }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-fluent border border-border px-3 py-2 text-sm">
      <span className="text-foreground/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          value ? 'bg-accent' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-surface shadow transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="w-6 text-xs font-medium text-foreground/60">{value ? 'Sí' : 'No'}</span>
    </div>
  )
}

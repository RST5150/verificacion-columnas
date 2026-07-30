import InfoTooltip from '@/components/ui/InfoTooltip'

interface Props {
  label: string
  value: string
  hint?: string
  info: string
}

// Stat tile: label en minúscula (sentence case), valor grande sans-serif
// (figuras proporcionales, no tabulares — es un número de display, no una
// columna de tabla).
export default function StatTile({ label, value, hint, info }: Props) {
  return (
    <div className="rounded-fluent border border-border bg-surface p-4">
      <p className="flex items-center gap-1 text-xs text-foreground/60">
        {label}
        <InfoTooltip text={info} />
      </p>
      <p className="mt-1 text-3xl font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
    </div>
  )
}

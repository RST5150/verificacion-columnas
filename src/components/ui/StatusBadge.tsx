import { Check, Minus, X } from 'lucide-react'

interface Props {
  value: boolean | null
}

export default function StatusBadge({ value }: Props) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-2 py-0.5 text-xs font-semibold text-foreground/50">
        <Minus className="h-3 w-3" />
        {'-'}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        value ? 'bg-success-surface text-success' : 'bg-danger-surface text-danger'
      }`}
    >
      {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {value ? 'Sí' : 'No'}
    </span>
  )
}

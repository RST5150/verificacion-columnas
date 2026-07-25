import { Trash2 } from 'lucide-react'
import { CONDICION_FIELDS, type ColumnaRow } from '@/types/forms'
import StatusBadge from '@/components/ui/StatusBadge'

interface Props {
  rows: ColumnaRow[]
  onRemove: (clientId: string) => void
}

export default function ColumnasTable({ rows, onRemove }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-foreground/60">Todavía no agregaste ninguna columna.</p>
  }

  return (
    <div className="overflow-x-auto rounded-fluent border border-border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-surface-alt text-left">
            <th className="px-3 py-2 font-semibold">Calle</th>
            <th className="px-3 py-2 font-semibold">Altura</th>
            <th className="px-3 py-2 font-semibold">N° columna</th>
            {CONDICION_FIELDS.map((f) => (
              <th key={f.key} className="px-3 py-2 font-semibold">
                {f.label}
              </th>
            ))}
            <th className="px-3 py-2 font-semibold">Observaciones</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.clientId} className={i % 2 === 1 ? 'bg-surface-alt/50' : ''}>
              <td className="border-t border-border px-3 py-2">{row.calle}</td>
              <td className="border-t border-border px-3 py-2">{row.altura}</td>
              <td className="border-t border-border px-3 py-2">{row.n_columna}</td>
              {CONDICION_FIELDS.map((f) => (
                <td key={f.key} className="border-t border-border px-3 py-2">
                  <StatusBadge value={row[f.key]} />
                </td>
              ))}
              <td className="border-t border-border px-3 py-2">{row.observaciones}</td>
              <td className="border-t border-border px-3 py-2">
                <button
                  type="button"
                  onClick={() => onRemove(row.clientId)}
                  aria-label="Eliminar columna"
                  className="text-danger hover:opacity-70"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

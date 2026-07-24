import { CONDICION_FIELDS, type ColumnaRow } from '@/types/forms'

interface Props {
  rows: ColumnaRow[]
  onRemove: (clientId: string) => void
}

export default function ColumnasTable({ rows, onRemove }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no agregaste ninguna columna.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left dark:bg-gray-800">
            <th className="border px-2 py-1 dark:border-gray-700">Calle</th>
            <th className="border px-2 py-1 dark:border-gray-700">Altura</th>
            <th className="border px-2 py-1 dark:border-gray-700">N° columna</th>
            {CONDICION_FIELDS.map((f) => (
              <th key={f.key} className="border px-2 py-1 dark:border-gray-700">
                {f.label}
              </th>
            ))}
            <th className="border px-2 py-1 dark:border-gray-700">Observaciones</th>
            <th className="border px-2 py-1 dark:border-gray-700"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.clientId}>
              <td className="border px-2 py-1 dark:border-gray-700">{row.calle}</td>
              <td className="border px-2 py-1 dark:border-gray-700">{row.altura}</td>
              <td className="border px-2 py-1 dark:border-gray-700">{row.n_columna}</td>
              {CONDICION_FIELDS.map((f) => (
                <td key={f.key} className="border px-2 py-1 dark:border-gray-700">
                  {row[f.key] ? 'SI' : 'NO'}
                </td>
              ))}
              <td className="border px-2 py-1 dark:border-gray-700">{row.observaciones}</td>
              <td className="border px-2 py-1 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => onRemove(row.clientId)}
                  className="text-red-600 hover:underline dark:text-red-400"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

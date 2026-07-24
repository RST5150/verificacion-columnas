import type { HeaderDraft } from '@/types/forms'

interface Props {
  value: HeaderDraft
  onChange: (value: HeaderDraft) => void
}

export default function OrdenHeaderForm({ value, onChange }: Props) {
  return (
    <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <legend className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Verificación Mecánica y Eléctrica de una Columna de Alumbrado Público
      </legend>

      <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
        Orden de servicio
        <input
          type="text"
          required
          value={value.orden_de_servicio}
          onChange={(e) => onChange({ ...value, orden_de_servicio: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder="0092"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
        Fecha
        <input
          type="date"
          required
          value={value.fecha}
          onChange={(e) => onChange({ ...value, fecha: e.target.value })}
          className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
        />
      </label>
    </fieldset>
  )
}

import { ZONA_OPTIONS, type FooterDraft } from '@/types/forms'

interface Props {
  value: FooterDraft
  onChange: (value: FooterDraft) => void
}

export default function ZonaForm({ value, onChange }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Zona</legend>

      <select
        name="zona"
        required
        aria-label="Zona"
        value={value.zona}
        onChange={(e) => onChange({ ...value, zona: e.target.value })}
        className="max-w-sm rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="" disabled>
          Seleccionar zona
        </option>
        {ZONA_OPTIONS.map((zona) => (
          <option key={zona} value={zona}>
            {zona}
          </option>
        ))}
      </select>
    </fieldset>
  )
}

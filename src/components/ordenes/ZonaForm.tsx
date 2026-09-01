import { ZONA_OPTIONS, type FooterDraft } from '@/types/forms'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'

interface Props {
  value: FooterDraft
  onChange: (value: FooterDraft) => void
}

export default function ZonaForm({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <Select
        label="Zona"
        name="zona"
        required
        value={value.zona}
        onChange={(e) => onChange({ ...value, zona: e.target.value })}
        className="max-w-sm"
      >
        <option value="" disabled>
          Seleccionar zona
        </option>
        {ZONA_OPTIONS.map((zona) => (
          <option key={zona} value={zona}>
            {zona}
          </option>
        ))}
      </Select>
      <Checkbox
        label="Plan de verificación técnica"
        checked={value.es_plan}
        onChange={(checked) => onChange({ ...value, es_plan: checked })}
      />
    </div>
  )
}

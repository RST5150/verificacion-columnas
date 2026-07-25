import { ZONA_OPTIONS, type FooterDraft } from '@/types/forms'
import Select from '@/components/ui/Select'

interface Props {
  value: FooterDraft
  onChange: (value: FooterDraft) => void
}

export default function ZonaForm({ value, onChange }: Props) {
  return (
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
  )
}

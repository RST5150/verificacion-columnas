import type { HeaderDraft } from '@/types/forms'
import TextField from '@/components/ui/TextField'

interface Props {
  value: HeaderDraft
  onChange: (value: HeaderDraft) => void
}

export default function OrdenHeaderForm({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TextField
        label="Orden de servicio"
        type="text"
        required
        value={value.orden_de_servicio}
        onChange={(e) => onChange({ ...value, orden_de_servicio: e.target.value })}
        placeholder="0092"
      />
      <TextField
        label="Fecha"
        type="date"
        required
        value={value.fecha}
        onChange={(e) => onChange({ ...value, fecha: e.target.value })}
      />
    </div>
  )
}

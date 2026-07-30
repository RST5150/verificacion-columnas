'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CONDICION_FIELDS, type ColumnaRow, type ConditionKey } from '@/types/forms'
import TextField from '@/components/ui/TextField'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import Button from '@/components/ui/Button'

interface Props {
  onAdd: (row: ColumnaRow) => void
}

type Condiciones = Record<ConditionKey, boolean>

const emptyCondiciones: Condiciones = Object.fromEntries(
  CONDICION_FIELDS.map((f) => [f.key, false])
) as Condiciones

export default function ColumnaRowForm({ onAdd }: Props) {
  // calle/altura persist across adds on purpose, so consecutive rows on the
  // same street/block don't need to be retyped each time.
  const [calle, setCalle] = useState('')
  const [altura, setAltura] = useState('')
  const [nColumna, setNColumna] = useState('')
  const [condiciones, setCondiciones] = useState<Condiciones>(emptyCondiciones)
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    if (!calle.trim() || !nColumna.trim() || !altura.trim()) {
      setError('Completá calle, altura y N° de columna.')
      return
    }

    setError(null)
    onAdd({
      clientId: crypto.randomUUID(),
      calle: calle.trim(),
      altura: altura.trim(),
      n_columna: nColumna.trim(),
      ...condiciones,
      observaciones: observaciones.trim(),
    })

    setNColumna('')
    setCondiciones(emptyCondiciones)
    setObservaciones('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField label="Calle" value={calle} onChange={(e) => setCalle(e.target.value)} placeholder="PELLEGRINI" />
        <TextField
          label="Altura"
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
          placeholder="2900"
        />
        <TextField
          label="N° de columna"
          value={nColumna}
          onChange={(e) => setNColumna(e.target.value)}
          placeholder="2921/00"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CONDICION_FIELDS.map((f) => (
          <ToggleSwitch
            key={f.key}
            label={f.label}
            value={condiciones[f.key]}
            onChange={(v) => setCondiciones({ ...condiciones, [f.key]: v })}
          />
        ))}
      </div>

      <TextField
        label="Observaciones"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        placeholder="ENCAMIZADO"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={handleAdd} className="self-start">
        Agregar columna
      </Button>
    </div>
  )
}

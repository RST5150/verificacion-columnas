'use client'

import { useState } from 'react'
import { CONDICION_FIELDS, type ColumnaRow, type ConditionKey } from '@/types/forms'

interface Props {
  onAdd: (row: ColumnaRow) => void
}

type Condiciones = Record<ConditionKey, boolean | null>

const emptyCondiciones: Condiciones = Object.fromEntries(
  CONDICION_FIELDS.map((f) => [f.key, null])
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
    const alturaNum = Number(altura)
    const missingCondicion = CONDICION_FIELDS.some((f) => condiciones[f.key] === null)

    if (!calle.trim() || !nColumna.trim() || !altura.trim() || !Number.isInteger(alturaNum) || alturaNum <= 0) {
      setError('Completá calle, altura (número entero positivo) y N° de columna.')
      return
    }
    if (missingCondicion) {
      setError('Elegí Sí/No para todas las condiciones antes de agregar la columna.')
      return
    }

    setError(null)
    onAdd({
      clientId: crypto.randomUUID(),
      calle: calle.trim(),
      altura: alturaNum,
      n_columna: nColumna.trim(),
      ...(condiciones as Record<ConditionKey, boolean>),
      observaciones: observaciones.trim(),
    })

    setNColumna('')
    setCondiciones(emptyCondiciones)
    setObservaciones('')
  }

  return (
    <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-700">
      <legend className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Agregar columna inspeccionada
      </legend>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
          Calle
          <input
            type="text"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder="PELLEGRINI"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
          Altura
          <input
            type="number"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder="2900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
          N° de columna
          <input
            type="text"
            value={nColumna}
            onChange={(e) => setNColumna(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            placeholder="2921/00"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CONDICION_FIELDS.map((f) => (
          <div
            key={f.key}
            className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
          >
            <span className="text-gray-700 dark:text-gray-300">{f.label}</span>
            <div className="flex gap-3 dark:text-gray-300">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name={f.key}
                  checked={condiciones[f.key] === true}
                  onChange={() => setCondiciones({ ...condiciones, [f.key]: true })}
                />
                Sí
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name={f.key}
                  checked={condiciones[f.key] === false}
                  onChange={() => setCondiciones({ ...condiciones, [f.key]: false })}
                />
                No
              </label>
            </div>
          </div>
        ))}
      </div>

      <label className="mt-4 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
        Observaciones
        <input
          type="text"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder="ENCAMIZADO"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleAdd}
        className="mt-4 rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        Agregar columna
      </button>
    </fieldset>
  )
}

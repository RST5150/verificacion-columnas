'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRequireAuth } from '@/lib/auth'
import UserBar from '@/components/auth/UserBar'
import OrdenHeaderForm from '@/components/ordenes/OrdenHeaderForm'
import ColumnaRowForm from '@/components/ordenes/ColumnaRowForm'
import ColumnasTable from '@/components/ordenes/ColumnasTable'
import ZonaForm from '@/components/ordenes/ZonaForm'
import {
  emptyFooter,
  emptyHeader,
  LOCALIDAD_FIJA,
  type ColumnaRow,
  type FooterDraft,
  type HeaderDraft,
} from '@/types/forms'

export default function NuevaOrdenPage() {
  const { session, profile, loading } = useRequireAuth()
  const [header, setHeader] = useState<HeaderDraft>(emptyHeader)
  const [footer, setFooter] = useState<FooterDraft>(emptyFooter)
  const [rows, setRows] = useState<ColumnaRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isValid =
    header.orden_de_servicio.trim() !== '' &&
    header.fecha !== '' &&
    footer.zona.trim() !== '' &&
    rows.length > 0

  const handleAddRow = (row: ColumnaRow) => {
    setRows((prev) => [...prev, row])
  }

  const handleRemoveRow = (clientId: string) => {
    setRows((prev) => prev.filter((r) => r.clientId !== clientId))
  }

  const handleSubmit = async () => {
    if (!isValid) return
    setSubmitting(true)
    setError(null)

    const { data: orden, error: ordenError } = await supabase
      .from('ordenes_servicio')
      .insert({
        orden_de_servicio: header.orden_de_servicio.trim(),
        localidad: LOCALIDAD_FIJA,
        fecha: header.fecha,
        zona: footer.zona,
      })
      .select()
      .single()

    if (ordenError || !orden) {
      setError(`No se pudo guardar la orden de servicio: ${ordenError?.message}`)
      setSubmitting(false)
      return
    }

    const { error: rowsError } = await supabase.from('columnas_inspeccionadas').insert(
      rows.map((r) => ({
        orden_servicio_id: orden.id,
        calle: r.calle,
        altura: r.altura,
        n_columna: r.n_columna,
        tapa: r.tapa,
        aplomada: r.aplomada,
        pintura: r.pintura,
        oxidada: r.oxidada,
        picada_por_oxido: r.picada_por_oxido,
        perforada_desprendimiento: r.perforada_desprendimiento,
        pat: r.pat,
        prot_diferencial: r.prot_diferencial,
        prot_contacto_directo: r.prot_contacto_directo,
        observaciones: r.observaciones || null,
      }))
    )

    if (rowsError) {
      // La orden ya quedó guardada sin columnas; se puede completar a mano
      // desde el editor de tablas de Supabase o reintentando la carga de filas.
      setError(`La orden se guardó, pero no se pudieron guardar las columnas: ${rowsError.message}`)
      setSubmitting(false)
      return
    }

    setHeader(emptyHeader)
    setFooter(emptyFooter)
    setRows([])
    setSuccess(true)
    setSubmitting(false)
  }

  if (loading || !session) return null

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nueva orden de servicio</h1>
        <div className="flex items-center gap-4">
          <Link href="/ordenes" className="text-sm text-blue-700 hover:underline dark:text-blue-400">
            Ver órdenes cargadas
          </Link>
          <UserBar email={session.user.email} profile={profile} />
        </div>
      </div>

      {success && (
        <p className="rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          Orden guardada correctamente.
        </p>
      )}
      {error && (
        <p className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <OrdenHeaderForm value={header} onChange={setHeader} />

      <ColumnaRowForm onAdd={handleAddRow} />

      <ColumnasTable rows={rows} onRemove={handleRemoveRow} />

      <ZonaForm value={footer} onChange={setFooter} />

      <button
        type="button"
        disabled={!isValid || submitting}
        onClick={handleSubmit}
        className="rounded bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
      >
        {submitting ? 'Guardando…' : 'Guardar orden de servicio'}
      </button>
    </main>
  )
}

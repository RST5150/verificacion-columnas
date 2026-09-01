'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { postToAppsScript } from '@/lib/sheets/write'
import { useRequireAuth } from '@/lib/auth'
import UserBar from '@/components/auth/UserBar'
import AppHeader from '@/components/layout/AppHeader'
import AuthState from '@/components/layout/AuthState'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
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

export const dynamic = 'force-dynamic';

export default function NuevaOrdenPage() {
  const { session, profile, loading, error: authError } = useRequireAuth()
  const [header, setHeader] = useState<HeaderDraft>(emptyHeader)
  const [footer, setFooter] = useState<FooterDraft>(emptyFooter)
  const [rows, setRows] = useState<ColumnaRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const missingFields = [
    header.orden_de_servicio.trim() === '' && 'orden de servicio',
    header.fecha === '' && 'fecha',
    footer.zona.trim() === '' && 'zona',
    rows.length === 0 && 'agregar al menos una columna (botón "Agregar columna")',
  ].filter((v): v is string => v !== false)

  const isValid = missingFields.length === 0

  const handleAddRow = (row: ColumnaRow) => {
    setRows((prev) => [...prev, row])
  }

  const handleRemoveRow = (clientId: string) => {
    setRows((prev) => prev.filter((r) => r.clientId !== clientId))
  }

  const handleSubmit = async () => {
    if (!isValid || !session) return
    setSubmitting(true)
    setError(null)

    try {
      await postToAppsScript({
        idToken: session.idToken,
        action: 'create_orden',
        orden: {
          orden_de_servicio: header.orden_de_servicio.trim(),
          localidad: LOCALIDAD_FIJA,
          fecha: header.fecha,
          zona: footer.zona,
          es_plan: footer.es_plan,
        },
        columnas: rows.map((r) => ({
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
        })),
      })
    } catch (err) {
      setError(`No se pudo guardar la orden de servicio: ${(err as Error).message}`)
      setSubmitting(false)
      return
    }

    setHeader(emptyHeader)
    setFooter(emptyFooter)
    setRows([])
    setSuccess(true)
    setSubmitting(false)
  }

  if (authError || loading || !session) return <AuthState error={authError} />

  return (
    <>
      <AppHeader
        title="Nueva orden de servicio"
        backHref="/ordenes"
        backLabel="Ver órdenes cargadas"
        actions={<UserBar email={session.user.email} profile={profile} />}
      />
      <main className="mx-auto max-w-5xl space-y-6 p-6">
        {success && (
          <p className="rounded-fluent border border-success bg-success-surface px-4 py-2 text-sm text-success">
            Orden guardada correctamente.
          </p>
        )}
        {error && (
          <p className="rounded-fluent border border-danger bg-danger-surface px-4 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Card title="1. Datos de la orden">
          <div className="flex flex-col gap-4">
            <OrdenHeaderForm value={header} onChange={setHeader} />
            <ZonaForm value={footer} onChange={setFooter} />
          </div>
        </Card>

        <Card title="2. Agregar columna inspeccionada">
          <ColumnaRowForm onAdd={handleAddRow} />
        </Card>

        <Card title={`3. Columnas cargadas (${rows.length})`}>
          <ColumnasTable rows={rows} onRemove={handleRemoveRow} />
        </Card>

        <div className="flex flex-col items-start gap-2">
          <Button
            variant="primary"
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            icon={<Save className="h-4 w-4" />}
          >
            {submitting ? 'Guardando…' : 'Guardar orden de servicio'}
          </Button>
          {!isValid && (
            <p className="text-sm text-foreground/60">Falta completar: {missingFields.join(', ')}.</p>
          )}
        </div>
      </main>
    </>
  )
}

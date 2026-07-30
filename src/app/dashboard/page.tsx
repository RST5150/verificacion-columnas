'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, TriangleAlert, X } from 'lucide-react'
import { CONFIG } from '@/lib/config'
import { fetchSheetRows } from '@/lib/sheets/read'
import { useRequireAuth } from '@/lib/auth'
import UserBar from '@/components/auth/UserBar'
import AppHeader from '@/components/layout/AppHeader'
import AuthState from '@/components/layout/AuthState'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import TextField from '@/components/ui/TextField'
import InfoTooltip from '@/components/ui/InfoTooltip'
import StatTile from '@/components/dashboard/StatTile'
import HorizontalBarChart from '@/components/dashboard/HorizontalBarChart'
import VerticalBarChart from '@/components/dashboard/VerticalBarChart'
import { CONDICION_FIELDS, ZONA_OPTIONS } from '@/types/forms'
import { buildDashboardData } from '@/lib/dashboard'
import type { OrdenServicio, ColumnaInspeccionada } from '@/types/sheets'

export const dynamic = 'force-dynamic'

const STATUS_THRESHOLDS = { bien: 90, atencion: 70 }

function statusFor(pct: number): { color: string; Icon: typeof Check; label: string } {
  if (pct >= STATUS_THRESHOLDS.bien) return { color: 'var(--success)', Icon: Check, label: 'Bien' }
  if (pct >= STATUS_THRESHOLDS.atencion) return { color: 'var(--warning)', Icon: TriangleAlert, label: 'Atención' }
  return { color: 'var(--danger)', Icon: X, label: 'Crítico' }
}

export default function DashboardPage() {
  const { session, profile, loading: authLoading, error: authError } = useRequireAuth()
  const [ordenes, setOrdenes] = useState<OrdenServicio[]>([])
  const [columnas, setColumnas] = useState<ColumnaInspeccionada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [zonaFilter, setZonaFilter] = useState('todos')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  useEffect(() => {
    if (!session) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [ordenesRows, columnasRows] = await Promise.all([
          fetchSheetRows<OrdenServicio>(CONFIG.ordenesCsvUrl, { numberFields: ['id'] }),
          fetchSheetRows<ColumnaInspeccionada>(CONFIG.columnasCsvUrl, {
            numberFields: ['id', 'orden_servicio_id'],
            booleanFields: CONDICION_FIELDS.map((f) => f.key),
          }),
        ])
        setOrdenes(ordenesRows)
        setColumnas(columnasRows)
      } catch (err) {
        setError((err as Error).message ?? 'Error al cargar los datos.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [session])

  const data = useMemo(
    () => buildDashboardData(ordenes, columnas, { zona: zonaFilter, fechaDesde, fechaHasta }),
    [ordenes, columnas, zonaFilter, fechaDesde, fechaHasta]
  )

  if (authError || authLoading || !session) return <AuthState error={authError} />

  return (
    <>
      <AppHeader
        title="Dashboard"
        backHref="/"
        backLabel="Inicio"
        actions={<UserBar email={session.user.email} profile={profile} />}
      />
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        {error && (
          <p className="rounded-fluent border border-danger bg-danger-surface px-4 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Card title="Filtros">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select label="Zona" value={zonaFilter} onChange={(e) => setZonaFilter(e.target.value)}>
              <option value="todos">Todas</option>
              {ZONA_OPTIONS.map((zona) => (
                <option key={zona} value={zona}>
                  {zona}
                </option>
              ))}
            </Select>
            <TextField label="Fecha desde" type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            <TextField label="Fecha hasta" type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </div>
        </Card>

        {loading ? (
          <p className="text-sm text-foreground/60">Cargando…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                label="Columnas inspeccionadas"
                value={data.totalColumnas.toLocaleString('es-AR')}
                info="Cantidad de columnas de alumbrado relevadas hasta ahora, según los filtros elegidos arriba."
              />
              <StatTile
                label="Órdenes de servicio"
                value={data.totalOrdenes.toLocaleString('es-AR')}
                info="Cantidad de órdenes de trabajo distintas que incluyen esas columnas."
              />
              <StatTile
                label="Columnas reparadas"
                value={data.totalReparadas.toLocaleString('es-AR')}
                hint="Observaciones que mencionan reparación"
                info="Columnas que la cuadrilla ya marcó como reparadas al momento de la inspección."
              />
              <StatTile
                label="En buen estado (promedio)"
                value={`${data.pctBienPromedio.toFixed(0)}%`}
                info="Qué porcentaje de las columnas están, en promedio, en condiciones correctas: sin daños, con sus protecciones eléctricas y en buen estado general."
              />
            </div>

            <Card
              title={
                <span className="inline-flex items-center gap-1">
                  Estado por ítem de inspección
                  <InfoTooltip text="Para cada aspecto revisado (tapa, pintura, oxidación, protecciones eléctricas, etc.), qué porcentaje de las columnas está en condiciones correctas en ese punto." />
                </span>
              }
            >
              <div className="mb-3 flex flex-wrap gap-4 text-xs text-foreground/60">
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" style={{ color: 'var(--success)' }} /> ≥{STATUS_THRESHOLDS.bien}% bien
                </span>
                <span className="inline-flex items-center gap-1">
                  <TriangleAlert className="h-3.5 w-3.5" style={{ color: 'var(--warning)' }} /> {STATUS_THRESHOLDS.atencion}
                  {'–'}
                  {STATUS_THRESHOLDS.bien - 1}% atención
                </span>
                <span className="inline-flex items-center gap-1">
                  <X className="h-3.5 w-3.5" style={{ color: 'var(--danger)' }} /> {'<'}
                  {STATUS_THRESHOLDS.atencion}% crítico
                </span>
              </div>
              {data.totalColumnas === 0 ? (
                <p className="text-sm text-foreground/60">No hay columnas para los filtros seleccionados.</p>
              ) : (
                <HorizontalBarChart
                  labelWidth={210}
                  maxValue={100}
                  items={data.porCondicion.map((c) => {
                    const status = statusFor(c.pctBien)
                    return {
                      key: c.key,
                      label: c.label,
                      value: c.pctBien,
                      displayValue: `${c.pctBien.toFixed(0)}%`,
                      color: status.color,
                    }
                  })}
                />
              )}
            </Card>

            <Card
              title={
                <span className="inline-flex items-center gap-1">
                  Columnas inspeccionadas por zona
                  <InfoTooltip text="Cuántas columnas se relevaron en cada zona de la ciudad." />
                </span>
              }
            >
              {data.porZona.length === 0 ? (
                <p className="text-sm text-foreground/60">No hay datos para los filtros seleccionados.</p>
              ) : (
                <VerticalBarChart
                  maxValue={Math.max(...data.porZona.map((z) => z.count))}
                  items={data.porZona.map((z) => ({
                    key: z.zona,
                    label: z.zona,
                    value: z.count,
                    displayValue: z.count.toLocaleString('es-AR'),
                  }))}
                />
              )}
            </Card>

            <p className="text-sm text-foreground/60">
              Para ver el detalle fila por fila,{' '}
              <a href="/ordenes" className="text-accent hover:underline">
                consultá el listado completo de órdenes
              </a>
              .
            </p>
          </>
        )}
      </main>
    </>
  )
}

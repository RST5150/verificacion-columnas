'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileDown, FileSpreadsheet, FileText, Trash2, X } from 'lucide-react'
import { CONFIG } from '@/lib/config'
import { fetchSheetRows } from '@/lib/sheets/read'
import { postToAppsScript } from '@/lib/sheets/write'
import { useRequireAuth } from '@/lib/auth'
import UserBar from '@/components/auth/UserBar'
import AppHeader from '@/components/layout/AppHeader'
import AuthState from '@/components/layout/AuthState'
import Card from '@/components/ui/Card'
import TextField from '@/components/ui/TextField'
import Select from '@/components/ui/Select'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'
import { CONDICION_FIELDS, ZONA_OPTIONS, type ConditionKey } from '@/types/forms'
import { formatFechaDDMMAAAA } from '@/lib/format'
import { exportColumnasToCsv, exportColumnasToPdf, exportColumnasToXlsx } from '@/lib/export'
import type { OrdenServicio, ColumnaInspeccionada } from '@/types/sheets'

type OrdenRow = OrdenServicio
type ColumnaRowDb = ColumnaInspeccionada

interface ColumnaConOrden extends ColumnaRowDb {
  orden: OrdenRow | undefined
}

type CondicionFilter = 'todos' | 'si' | 'no'

const emptyCondicionFilters: Record<ConditionKey, CondicionFilter> = Object.fromEntries(
  CONDICION_FIELDS.map((f) => [f.key, 'todos'])
) as Record<ConditionKey, CondicionFilter>

export const dynamic = 'force-dynamic';

export default function OrdenesListPage() {
  const { session, profile, loading: authLoading, error: authError } = useRequireAuth()
  const [rows, setRows] = useState<ColumnaConOrden[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [zonaFilter, setZonaFilter] = useState('todos')
  const [condicionFilters, setCondicionFilters] = useState(emptyCondicionFilters)

  useEffect(() => {
    if (!session) return

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const [ordenes, columnas] = await Promise.all([
          fetchSheetRows<OrdenRow>(CONFIG.ordenesCsvUrl, { numberFields: ['id'] }),
          fetchSheetRows<ColumnaRowDb>(CONFIG.columnasCsvUrl, {
            numberFields: ['id', 'orden_servicio_id'],
            booleanFields: CONDICION_FIELDS.map((f) => f.key),
          }),
        ])

        const ordenesById = new Map(ordenes.map((o) => [o.id, o]))
        const joined = columnas
          .map((c) => ({ ...c, orden: ordenesById.get(c.orden_servicio_id) }))
          .sort((a, b) => b.id - a.id)

        setRows(joined)
      } catch (err) {
        setError((err as Error).message ?? 'Error al cargar los datos.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [session])

  const canDelete = (row: ColumnaConOrden) =>
    profile?.role === 'admin' || (!!session && row.orden?.created_by === session.user.email)

  const handleDelete = async (row: ColumnaConOrden) => {
    const label = `${row.calle} ${row.altura} (${row.n_columna}) — orden ${row.orden?.orden_de_servicio}`
    if (!window.confirm(`¿Eliminar la columna ${label}?`)) return
    if (!session) return

    try {
      await postToAppsScript({ idToken: session.idToken, action: 'delete_columna', id: row.id })
    } catch (err) {
      window.alert(`No se pudo eliminar: ${(err as Error).message}`)
      return
    }

    setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (term) {
        const haystack = [row.orden?.orden_de_servicio, row.calle, row.n_columna, row.observaciones]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(term)) return false
      }

      if (zonaFilter !== 'todos' && row.orden?.zona !== zonaFilter) return false

      if (fechaDesde && (!row.orden?.fecha || row.orden.fecha < fechaDesde)) return false
      if (fechaHasta && (!row.orden?.fecha || row.orden.fecha > fechaHasta)) return false

      for (const f of CONDICION_FIELDS) {
        const filter = condicionFilters[f.key]
        if (filter === 'todos') continue
        if (row[f.key] !== (filter === 'si')) return false
      }

      return true
    })
  }, [rows, search, fechaDesde, fechaHasta, zonaFilter, condicionFilters])

  const columnCount = 6 + CONDICION_FIELDS.length + 2
  const hasActiveFilters =
    !!search ||
    !!fechaDesde ||
    !!fechaHasta ||
    zonaFilter !== 'todos' ||
    Object.values(condicionFilters).some((v) => v !== 'todos')

  const clearFilters = () => {
    setSearch('')
    setFechaDesde('')
    setFechaHasta('')
    setZonaFilter('todos')
    setCondicionFilters(emptyCondicionFilters)
  }

  if (authError || authLoading || !session) return <AuthState error={authError} />

  return (
    <>
      <AppHeader
        title="Órdenes de servicio cargadas"
        backHref="/"
        backLabel="Inicio"
        actions={<UserBar email={session.user.email} profile={profile} />}
      />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        {error && (
          <p className="rounded-fluent border border-danger bg-danger-surface px-4 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Card title="Filtros">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TextField
                label="Buscar (orden, calle, columna, observaciones)"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="PELLEGRINI"
              />
              <Select label="Zona" value={zonaFilter} onChange={(e) => setZonaFilter(e.target.value)}>
                <option value="todos">Todas</option>
                {ZONA_OPTIONS.map((zona) => (
                  <option key={zona} value={zona}>
                    {zona}
                  </option>
                ))}
              </Select>
              <TextField
                label="Fecha desde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
              <TextField
                label="Fecha hasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {CONDICION_FIELDS.map((f) => (
                <Select
                  key={f.key}
                  label={f.label}
                  value={condicionFilters[f.key]}
                  onChange={(e) =>
                    setCondicionFilters({ ...condicionFilters, [f.key]: e.target.value as CondicionFilter })
                  }
                >
                  <option value="todos">Todos</option>
                  <option value="si">Sí</option>
                  <option value="no">No</option>
                </Select>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar filtros
              </button>
            )}
          </div>
        </Card>

        {loading ? (
          <p className="text-sm text-foreground/60">Cargando…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-foreground/60">
                {filteredRows.length} de {rows.length} columnas
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  icon={<FileSpreadsheet className="h-4 w-4" />}
                  disabled={filteredRows.length === 0}
                  onClick={() => exportColumnasToXlsx(filteredRows)}
                >
                  Descargar .xlsx
                </Button>
                <Button
                  variant="secondary"
                  icon={<FileText className="h-4 w-4" />}
                  disabled={filteredRows.length === 0}
                  onClick={() => exportColumnasToCsv(filteredRows)}
                >
                  Descargar .csv
                </Button>
                <Button
                  variant="secondary"
                  icon={<FileDown className="h-4 w-4" />}
                  disabled={filteredRows.length === 0}
                  onClick={() => exportColumnasToPdf(filteredRows)}
                >
                  Descargar .pdf
                </Button>
              </div>
            </div>

            {/* Mobile: card list */}
            <div className="space-y-3 sm:hidden">
              {filteredRows.length === 0 && (
                <p className="rounded-fluent border border-border bg-surface p-4 text-center text-sm text-foreground/60">
                  No se encontraron resultados.
                </p>
              )}
              {filteredRows.map((row) => (
                <Card key={row.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {row.calle} {row.altura}
                      </p>
                      <p className="text-xs text-foreground/60">
                        N° {row.n_columna} · Orden {row.orden?.orden_de_servicio} ·{' '}
                        {formatFechaDDMMAAAA(row.orden?.fecha)} · {row.orden?.zona}
                      </p>
                    </div>
                    {canDelete(row) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        aria-label="Eliminar columna"
                        className="text-danger hover:opacity-70"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {CONDICION_FIELDS.map((f) => (
                      <span key={f.key} className="flex items-center gap-1 text-xs text-foreground/70">
                        {f.label}: <StatusBadge value={row[f.key]} />
                      </span>
                    ))}
                  </div>
                  {row.observaciones && (
                    <p className="mt-3 text-sm text-foreground/70">{row.observaciones}</p>
                  )}
                </Card>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto rounded-fluent border border-border sm:block">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt text-left">
                    <th className="px-3 py-2 font-semibold">Orden</th>
                    <th className="px-3 py-2 font-semibold">Fecha</th>
                    <th className="px-3 py-2 font-semibold">Zona</th>
                    <th className="px-3 py-2 font-semibold">Calle</th>
                    <th className="px-3 py-2 font-semibold">Altura</th>
                    <th className="px-3 py-2 font-semibold">N° columna</th>
                    {CONDICION_FIELDS.map((f) => (
                      <th key={f.key} className="px-3 py-2 font-semibold">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-3 py-2 font-semibold">Observaciones</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => (
                    <tr key={row.id} className={i % 2 === 1 ? 'bg-surface-alt/50' : ''}>
                      <td className="border-t border-border px-3 py-2">{row.orden?.orden_de_servicio}</td>
                      <td className="border-t border-border px-3 py-2">
                        {formatFechaDDMMAAAA(row.orden?.fecha)}
                      </td>
                      <td className="border-t border-border px-3 py-2">{row.orden?.zona}</td>
                      <td className="border-t border-border px-3 py-2">{row.calle}</td>
                      <td className="border-t border-border px-3 py-2">{row.altura}</td>
                      <td className="border-t border-border px-3 py-2">{row.n_columna}</td>
                      {CONDICION_FIELDS.map((f) => (
                        <td key={f.key} className="border-t border-border px-3 py-2">
                          <StatusBadge value={row[f.key]} />
                        </td>
                      ))}
                      <td className="border-t border-border px-3 py-2">{row.observaciones}</td>
                      <td className="border-t border-border px-3 py-2">
                        {canDelete(row) && (
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            aria-label="Eliminar columna"
                            className="text-danger hover:opacity-70"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columnCount}
                        className="border-t border-border px-2 py-4 text-center text-foreground/60"
                      >
                        No se encontraron resultados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  )
}

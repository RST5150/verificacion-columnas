'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useRequireAuth } from '@/lib/auth'
import UserBar from '@/components/auth/UserBar'
import { CONDICION_FIELDS, ZONA_OPTIONS, type ConditionKey } from '@/types/forms'
import { formatFechaDDMMAAAA } from '@/lib/format'
import type { Database } from '@/types/database'

type OrdenRow = Database['public']['Tables']['ordenes_servicio']['Row']
type ColumnaRowDb = Database['public']['Tables']['columnas_inspeccionadas']['Row']

interface ColumnaConOrden extends ColumnaRowDb {
  orden: OrdenRow | undefined
}

type CondicionFilter = 'todos' | 'si' | 'no'

const emptyCondicionFilters: Record<ConditionKey, CondicionFilter> = Object.fromEntries(
  CONDICION_FIELDS.map((f) => [f.key, 'todos'])
) as Record<ConditionKey, CondicionFilter>

export default function OrdenesListPage() {
  const { session, profile, loading: authLoading } = useRequireAuth()
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

      const [ordenesRes, columnasRes] = await Promise.all([
        supabase.from('ordenes_servicio').select('*'),
        supabase.from('columnas_inspeccionadas').select('*'),
      ])

      if (ordenesRes.error || columnasRes.error) {
        setError(ordenesRes.error?.message ?? columnasRes.error?.message ?? 'Error al cargar los datos.')
        setLoading(false)
        return
      }

      const ordenesById = new Map((ordenesRes.data ?? []).map((o) => [o.id, o]))
      const joined = (columnasRes.data ?? [])
        .map((c) => ({ ...c, orden: ordenesById.get(c.orden_servicio_id) }))
        .sort((a, b) => b.id - a.id)

      setRows(joined)
      setLoading(false)
    }

    load()
  }, [session])

  const canDelete = (row: ColumnaConOrden) =>
    profile?.role === 'admin' || (!!session && row.orden?.created_by === session.user.id)

  const handleDelete = async (row: ColumnaConOrden) => {
    const label = `${row.calle} ${row.altura} (${row.n_columna}) — orden ${row.orden?.orden_de_servicio}`
    if (!window.confirm(`¿Eliminar la columna ${label}?`)) return

    const { error } = await supabase.from('columnas_inspeccionadas').delete().eq('id', row.id)

    if (error) {
      window.alert(`No se pudo eliminar: ${error.message}`)
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

  if (authLoading || !session) return null

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Órdenes de servicio cargadas</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/ordenes/nueva"
            className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Cargar nueva orden
          </Link>
          <UserBar email={session.user.email} profile={profile} />
        </div>
      </div>

      {error && (
        <p className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-4 rounded border border-gray-300 p-4 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
            Buscar (orden, calle, columna, observaciones)
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="PELLEGRINI"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
            Zona
            <select
              value={zonaFilter}
              onChange={(e) => setZonaFilter(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="todos">Todas</option>
              {ZONA_OPTIONS.map((zona) => (
                <option key={zona} value={zona}>
                  {zona}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
            Fecha desde
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
            Fecha hasta
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CONDICION_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
              {f.label}
              <select
                value={condicionFilters[f.key]}
                onChange={(e) =>
                  setCondicionFilters({ ...condicionFilters, [f.key]: e.target.value as CondicionFilter })
                }
                className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="todos">Todos</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </label>
          ))}
        </div>

        {(search ||
          fechaDesde ||
          fechaHasta ||
          zonaFilter !== 'todos' ||
          Object.values(condicionFilters).some((v) => v !== 'todos')) && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setFechaDesde('')
              setFechaHasta('')
              setZonaFilter('todos')
              setCondicionFilters(emptyCondicionFilters)
            }}
            className="text-sm text-blue-700 hover:underline dark:text-blue-400"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando…</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredRows.length} de {rows.length} columnas
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-left dark:bg-gray-800">
                  <th className="border px-2 py-1 dark:border-gray-700">Orden</th>
                  <th className="border px-2 py-1 dark:border-gray-700">Fecha</th>
                  <th className="border px-2 py-1 dark:border-gray-700">Zona</th>
                  <th className="border px-2 py-1 dark:border-gray-700">Calle</th>
                  <th className="border px-2 py-1 dark:border-gray-700">Altura</th>
                  <th className="border px-2 py-1 dark:border-gray-700">N° columna</th>
                  {CONDICION_FIELDS.map((f) => (
                    <th key={f.key} className="border px-2 py-1 dark:border-gray-700">
                      {f.label}
                    </th>
                  ))}
                  <th className="border px-2 py-1 dark:border-gray-700">Observaciones</th>
                  <th className="border px-2 py-1 dark:border-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="border px-2 py-1 dark:border-gray-700">{row.orden?.orden_de_servicio}</td>
                    <td className="border px-2 py-1 dark:border-gray-700">
                      {formatFechaDDMMAAAA(row.orden?.fecha)}
                    </td>
                    <td className="border px-2 py-1 dark:border-gray-700">{row.orden?.zona}</td>
                    <td className="border px-2 py-1 dark:border-gray-700">{row.calle}</td>
                    <td className="border px-2 py-1 dark:border-gray-700">{row.altura}</td>
                    <td className="border px-2 py-1 dark:border-gray-700">{row.n_columna}</td>
                    {CONDICION_FIELDS.map((f) => (
                      <td key={f.key} className="border px-2 py-1 dark:border-gray-700">
                        {row[f.key] ? 'SI' : 'NO'}
                      </td>
                    ))}
                    <td className="border px-2 py-1 dark:border-gray-700">{row.observaciones}</td>
                    <td className="border px-2 py-1 dark:border-gray-700">
                      {canDelete(row) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="text-red-600 hover:underline dark:text-red-400"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="border px-2 py-4 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400"
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
  )
}

import { CONDICION_FIELDS, type ConditionKey } from '@/types/forms'
import type { ColumnaInspeccionada, OrdenServicio } from '@/types/sheets'

// Campos donde SI = bien (tiene tapa, está aplomada, tiene PAT, etc.). El
// resto (oxidada, picada_por_oxido, perforada_desprendimiento) es al revés:
// SI = defecto. Normalizamos todo a "% en buen estado" para poder comparar
// los 9 ítems en un solo gráfico sin que la dirección semántica confunda.
const BAD_WHEN_TRUE: ReadonlySet<ConditionKey> = new Set(['oxidada', 'picada_por_oxido', 'perforada_desprendimiento'])

// Sin dato (null) no cuenta como "bien": solo un SI explícito en los campos
// normales, o un NO explícito en los BAD_WHEN_TRUE, suma al %.
export function isBienField(key: ConditionKey, row: Pick<ColumnaInspeccionada, ConditionKey>): boolean {
  const value = row[key]
  return BAD_WHEN_TRUE.has(key) ? value === false : value === true
}

export function esReparada(observaciones: string | null | undefined): boolean {
  return /reparad/i.test(observaciones ?? '')
}

export interface CondicionStat {
  key: ConditionKey
  label: string
  pctBien: number
  bien: number
  total: number
}

export interface DashboardData {
  totalColumnas: number
  totalOrdenes: number
  totalReparadas: number
  pctBienPromedio: number
  porCondicion: CondicionStat[]
  porZona: { zona: string; count: number }[]
}

interface Filtros {
  zona?: string
  fechaDesde?: string
  fechaHasta?: string
}

export function buildDashboardData(
  ordenes: OrdenServicio[],
  columnas: ColumnaInspeccionada[],
  filtros: Filtros = {}
): DashboardData {
  const ordenesById = new Map(ordenes.map((o) => [o.id, o]))

  const filtered = columnas.filter((c) => {
    const orden = ordenesById.get(c.orden_servicio_id)
    if (filtros.zona && filtros.zona !== 'todos' && orden?.zona !== filtros.zona) return false
    if (filtros.fechaDesde && (!orden?.fecha || orden.fecha < filtros.fechaDesde)) return false
    if (filtros.fechaHasta && (!orden?.fecha || orden.fecha > filtros.fechaHasta)) return false
    return true
  })

  const totalColumnas = filtered.length
  const ordenIds = new Set(filtered.map((c) => c.orden_servicio_id))
  const totalOrdenes = ordenIds.size
  const totalReparadas = filtered.filter((c) => esReparada(c.observaciones)).length

  const porCondicion: CondicionStat[] = CONDICION_FIELDS.map((f) => {
    const bien = filtered.filter((row) => isBienField(f.key, row)).length
    return {
      key: f.key,
      label: f.label,
      bien,
      total: totalColumnas,
      pctBien: totalColumnas === 0 ? 0 : (bien / totalColumnas) * 100,
    }
  })

  const pctBienPromedio =
    porCondicion.length === 0 ? 0 : porCondicion.reduce((sum, c) => sum + c.pctBien, 0) / porCondicion.length

  const zonaCounts = new Map<string, number>()
  for (const c of filtered) {
    const zona = ordenesById.get(c.orden_servicio_id)?.zona ?? 'Sin zona'
    zonaCounts.set(zona, (zonaCounts.get(zona) ?? 0) + 1)
  }
  const porZona = [...zonaCounts.entries()]
    .map(([zona, count]) => ({ zona, count }))
    .sort((a, b) => b.count - a.count)

  return { totalColumnas, totalOrdenes, totalReparadas, pctBienPromedio, porCondicion, porZona }
}

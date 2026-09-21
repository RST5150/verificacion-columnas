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

export interface CondicionSiNoNulo {
  key: ConditionKey
  label: string
  si: number
  no: number
  nulo: number
  total: number
}

export interface DashboardData {
  totalColumnas: number
  totalOrdenes: number
  totalReparadas: number
  pctBienPromedio: number
  porCondicion: CondicionStat[]
  porCondicionSiNoNulo: CondicionSiNoNulo[]
  porZona: { zona: string; count: number }[]
  porReparada: { label: string; count: number }[]
}

interface Filtros {
  zona?: string
  fechaDesde?: string
  fechaHasta?: string
}

// El Sheet mezcla formatos de fecha: ISO (2026-07-13), M/D/AAAA sin ceros (9/17/2026, fechas
// reales de Sheets exportadas en formato US) y DD/MM/AAAA con ceros (04/05/2026, texto tipeado).
export function normalizarFecha(raw: string | null | undefined): string | null {
  const s = (raw ?? '').trim()
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const padded = m[1].length === 2 && m[2].length === 2
  const [dia, mes] = padded ? [m[1], m[2]] : [m[2], m[1]]
  return `${m[3]}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
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
    if (filtros.fechaDesde || filtros.fechaHasta) {
      const fecha = normalizarFecha(orden?.fecha)
      if (!fecha) return false
      if (filtros.fechaDesde && fecha < filtros.fechaDesde) return false
      if (filtros.fechaHasta && fecha > filtros.fechaHasta) return false
    }
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

  const porCondicionSiNoNulo: CondicionSiNoNulo[] = CONDICION_FIELDS.map((f) => {
    const si = filtered.filter((row) => row[f.key] === true).length
    const no = filtered.filter((row) => row[f.key] === false).length
    return { key: f.key, label: f.label, si, no, nulo: totalColumnas - si - no, total: totalColumnas }
  })

  const zonaCounts = new Map<string, number>()
  for (const c of filtered) {
    const zona = ordenesById.get(c.orden_servicio_id)?.zona ?? 'Sin zona'
    zonaCounts.set(zona, (zonaCounts.get(zona) ?? 0) + 1)
  }
  const porZona = [...zonaCounts.entries()]
    .map(([zona, count]) => ({ zona, count }))
    .sort((a, b) => b.count - a.count)

  const porReparada = [
    { label: 'Reparada', count: totalReparadas },
    { label: 'No reparada', count: totalColumnas - totalReparadas },
  ]

  return {
    totalColumnas,
    totalOrdenes,
    totalReparadas,
    pctBienPromedio,
    porCondicion,
    porCondicionSiNoNulo,
    porZona,
    porReparada,
  }
}

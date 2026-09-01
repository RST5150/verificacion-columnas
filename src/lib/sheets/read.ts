import * as XLSX from 'xlsx'

interface ParseOptions {
  numberFields?: string[]
  booleanFields?: string[]
}

function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    result[key.trim().toLowerCase()] = value
  }
  return result
}

// Una celda vacía es "sin dato" (no se registró esa inspección), distinto
// de un NO explícito — se preserva como null en vez de forzarla a false.
function toBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === '') return null
  return normalized === 'true' || normalized === 'verdadero' || normalized === 'si' || normalized === 'sí' || normalized === '1'
}

function toNumber(value: unknown): number {
  const n = Number(String(value ?? '').trim().replace(',', '.'))
  return Number.isNaN(n) ? 0 : n
}

// Lee una hoja de Google Sheets publicada como CSV. Los headers se
// normalizan a minúscula para no depender de cómo se hayan escrito las
// columnas en la planilla (ej. "Email" o "email" funcionan igual).
export async function fetchSheetRows<T>(url: string, options: ParseOptions = {}): Promise<T[]> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('No se pudo cargar la planilla. Verificá que esté publicada como CSV.')

  const text = await res.text()
  const workbook = XLSX.read(text, { type: 'string' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false, defval: '' })

  const { numberFields = [], booleanFields = [] } = options

  return rawRows.map((raw) => {
    const row = normalizeRow(raw)
    for (const field of numberFields) row[field] = toNumber(row[field])
    for (const field of booleanFields) row[field] = toBoolean(row[field])
    return row as unknown as T
  })
}

import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CONDICION_FIELDS } from '@/types/forms'
import { formatFechaDDMMAAAA } from '@/lib/format'
import type { Database } from '@/types/database'

type OrdenRow = Database['public']['Tables']['ordenes_servicio']['Row']
type ColumnaRowDb = Database['public']['Tables']['columnas_inspeccionadas']['Row']

interface ColumnaConOrden extends ColumnaRowDb {
  orden: OrdenRow | undefined
}

const HEADERS = [
  'Orden',
  'Fecha',
  'Zona',
  'Calle',
  'Altura',
  'N° columna',
  ...CONDICION_FIELDS.map((f) => f.label),
  'Observaciones',
]

function rowsToAoa(rows: ColumnaConOrden[]): (string | number)[][] {
  const body = rows.map((row) => [
    row.orden?.orden_de_servicio ?? '',
    formatFechaDDMMAAAA(row.orden?.fecha),
    row.orden?.zona ?? '',
    row.calle,
    row.altura,
    row.n_columna,
    ...CONDICION_FIELDS.map((f) => (row[f.key] ? 'Sí' : 'No')),
    row.observaciones ?? '',
  ])

  return [HEADERS, ...body]
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportColumnasToXlsx(rows: ColumnaConOrden[], filename = 'columnas.xlsx') {
  const sheet = XLSX.utils.aoa_to_sheet(rowsToAoa(rows))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Columnas')
  XLSX.writeFile(workbook, filename)
}

export function exportColumnasToCsv(rows: ColumnaConOrden[], filename = 'columnas.csv') {
  const sheet = XLSX.utils.aoa_to_sheet(rowsToAoa(rows))
  const csv = XLSX.utils.sheet_to_csv(sheet)
  downloadBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }), filename)
}

export function exportColumnasToPdf(rows: ColumnaConOrden[], filename = 'columnas.pdf') {
  const [head, ...body] = rowsToAoa(rows)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFontSize(14)
  doc.text('Órdenes de servicio - columnas inspeccionadas', 14, 15)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Generado el ${new Date().toLocaleDateString('es-AR')}`, 14, 21)

  autoTable(doc, {
    startY: 26,
    head: [head],
    body,
    styles: { fontSize: 6, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: [0, 120, 212], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 244, 243] },
    margin: { left: 10, right: 10 },
  })

  doc.save(filename)
}

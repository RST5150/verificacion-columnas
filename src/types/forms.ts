export type ConditionKey =
  | 'tapa'
  | 'aplomada'
  | 'pintura'
  | 'oxidada'
  | 'picada_por_oxido'
  | 'perforada_desprendimiento'
  | 'pat'
  | 'prot_diferencial'
  | 'prot_contacto_directo'

export const CONDICION_FIELDS: { key: ConditionKey; label: string }[] = [
  { key: 'tapa', label: 'Tapa' },
  { key: 'aplomada', label: 'Aplomada' },
  { key: 'pintura', label: 'Pintura' },
  { key: 'oxidada', label: 'Oxidada' },
  { key: 'picada_por_oxido', label: 'Picada por óxido' },
  { key: 'perforada_desprendimiento', label: 'Perforada / desprend. de material' },
  { key: 'pat', label: 'PAT' },
  { key: 'prot_diferencial', label: 'Prot. diferencial' },
  { key: 'prot_contacto_directo', label: 'Prot. contra contacto directo' },
]

export interface ColumnaRow {
  clientId: string
  calle: string
  altura: string
  n_columna: string
  tapa: boolean | null
  aplomada: boolean | null
  pintura: boolean | null
  oxidada: boolean | null
  picada_por_oxido: boolean | null
  perforada_desprendimiento: boolean | null
  pat: boolean | null
  prot_diferencial: boolean | null
  prot_contacto_directo: boolean | null
  observaciones: string
}

// Por ahora todas las órdenes son de Rosario, así que el campo no se
// muestra en el formulario y se completa con este valor fijo.
export const LOCALIDAD_FIJA = 'ROSARIO'

export interface HeaderDraft {
  orden_de_servicio: string
  fecha: string
}

export const ZONA_OPTIONS = ['Zona 1', 'Zona 2', 'Zona 3'] as const

export interface FooterDraft {
  zona: string
  es_plan: boolean
}

export const emptyHeader: HeaderDraft = {
  orden_de_servicio: '',
  fecha: '',
}

export const emptyFooter: FooterDraft = {
  zona: '',
  es_plan: false,
}

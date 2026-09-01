export interface OrdenServicio {
  id: number
  orden_de_servicio: string
  localidad: string
  fecha: string
  zona: string | null
  // No existe en las ordenes cargadas antes de agregar esta columna al
  // Sheet: llega null (sin dato), no false, para esas filas historicas.
  es_plan: boolean | null
  created_by: string | null
  created_at: string
}

export interface ColumnaInspeccionada {
  id: number
  orden_servicio_id: number
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
  observaciones: string | null
  created_at: string
}

export interface Usuario {
  email: string
  role: 'user' | 'admin'
}

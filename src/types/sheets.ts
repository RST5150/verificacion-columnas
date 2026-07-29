export interface OrdenServicio {
  id: number
  orden_de_servicio: string
  localidad: string
  fecha: string
  zona: string | null
  created_by: string | null
  created_at: string
}

export interface ColumnaInspeccionada {
  id: number
  orden_servicio_id: number
  calle: string
  altura: number
  n_columna: string
  tapa: boolean
  aplomada: boolean
  pintura: boolean
  oxidada: boolean
  picada_por_oxido: boolean
  perforada_desprendimiento: boolean
  pat: boolean
  prot_diferencial: boolean
  prot_contacto_directo: boolean
  observaciones: string | null
  created_at: string
}

export interface Usuario {
  email: string
  role: 'user' | 'admin'
}

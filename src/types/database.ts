// Hand-written to match app/supabase/migrations/0001_init.sql,
// 0002_rename_empresa_to_zona.sql and 0003_auth_and_delete_permissions.sql.
// Can later be replaced by `npx supabase gen types typescript` once the
// Supabase CLI is linked to the project.

export interface Database {
  public: {
    Tables: {
      ordenes_servicio: {
        Row: {
          id: number
          orden_de_servicio: string
          localidad: string
          fecha: string
          zona: string | null
          imagen_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          orden_de_servicio: string
          localidad: string
          fecha: string
          zona?: string | null
          imagen_url?: string | null
          created_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['ordenes_servicio']['Insert']>
        Relationships: []
      }
      columnas_inspeccionadas: {
        Row: {
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
        Insert: {
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
          observaciones?: string | null
        }
        Update: Partial<Database['public']['Tables']['columnas_inspeccionadas']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'columnas_inspeccionadas_orden_servicio_id_fkey'
            columns: ['orden_servicio_id']
            referencedRelation: 'ordenes_servicio'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'user' | 'admin'
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

// Convierte una fecha ISO ("yyyy-mm-dd", tal como la devuelve Postgres) a
// formato dd/mm/aaaa para mostrar en pantalla.
export function formatFechaDDMMAAAA(fechaIso: string | null | undefined): string {
  if (!fechaIso) return ''
  const [year, month, day] = fechaIso.split('-')
  if (!year || !month || !day) return fechaIso
  return `${day}/${month}/${year}`
}

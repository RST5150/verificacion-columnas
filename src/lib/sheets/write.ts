import { CONFIG } from '@/lib/config'

interface AppsScriptResponse {
  ok: boolean
  error?: string
  id?: number
}

// Sin Content-Type explícito a propósito: evita el preflight de CORS contra
// el Web App de Apps Script (igual que tableros_alumbrado_publico/src/forms.js).
export async function postToAppsScript(payload: Record<string, unknown>): Promise<AppsScriptResponse> {
  const res = await fetch(CONFIG.appsScriptUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('No se pudo contactar el servidor de la planilla.')

  const json = (await res.json()) as AppsScriptResponse
  if (!json.ok) throw new Error(json.error ?? 'Ocurrió un error al guardar los datos.')
  return json
}

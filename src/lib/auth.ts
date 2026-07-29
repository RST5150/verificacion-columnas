'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONFIG } from '@/lib/config'
import { fetchSheetRows } from '@/lib/sheets/read'
import type { Usuario } from '@/types/sheets'

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (response: { credential: string }) => void
        auto_select?: boolean
      }) => void
      prompt: () => void
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
      disableAutoSelect: () => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

export interface AuthSession {
  idToken: string
  user: { email: string }
}

const STORAGE_KEY = 'verificacion-columnas-auth'

interface StoredAuth {
  idToken: string
  email: string
  exp: number
}

function decodeIdToken(idToken: string): { email: string; exp: number } | null {
  try {
    const payload = idToken.split('.')[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (!json.email) return null
    return { email: json.email as string, exp: json.exp as number }
  } catch {
    return null
  }
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuth
    if (!parsed.exp || parsed.exp * 1000 < Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function storeAuth(auth: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

function waitForGoogleIdentity(timeoutMs = 10000): Promise<GoogleIdentity> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      if (window.google) {
        resolve(window.google)
        return
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('No se pudo cargar el inicio de sesión de Google.'))
        return
      }
      setTimeout(check, 100)
    }
    check()
  })
}

async function resolveProfile(email: string): Promise<Usuario | null> {
  const usuarios = await fetchSheetRows<Usuario>(CONFIG.usuariosCsvUrl)
  const normalized = email.trim().toLowerCase()
  return usuarios.find((u) => String(u.email).trim().toLowerCase() === normalized) ?? null
}

async function establishFromIdToken(idToken: string): Promise<{ session: AuthSession; profile: Usuario }> {
  const decoded = decodeIdToken(idToken)
  if (!decoded) throw new Error('No se pudo leer la sesión de Google.')

  const profile = await resolveProfile(decoded.email)
  if (!profile) {
    clearStoredAuth()
    throw new Error('Tu cuenta no tiene acceso. Pedile a un administrador que te agregue a la hoja "Usuarios".')
  }

  storeAuth({ idToken, email: decoded.email, exp: decoded.exp })
  return { session: { idToken, user: { email: decoded.email } }, profile }
}

export function useSession() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [profile, setProfile] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const applyCredential = async (idToken: string) => {
      const { session: newSession, profile: newProfile } = await establishFromIdToken(idToken)
      if (!active) return
      setSession(newSession)
      setProfile(newProfile)
    }

    // Solo restaura una sesión guardada en localStorage (login previo por
    // botón). No se intenta un auto-login silencioso con Google acá: ese
    // flujo (One Tap/FedCM) vive únicamente en renderGoogleButton, para
    // evitar llamar a google.accounts.id.initialize() más de una vez con
    // callbacks distintos (rompe el SDK de Google: "solo se usa la última
    // instancia inicializada").
    const init = async () => {
      const stored = readStoredAuth()
      if (stored) {
        try {
          await applyCredential(stored.idToken)
        } catch (err) {
          if (active) setError((err as Error).message)
        }
      }
      if (active) setLoading(false)
    }

    init()

    return () => {
      active = false
    }
  }, [])

  return { session, profile, loading, error }
}

export function useRequireAuth() {
  const { session, profile, loading, error } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session && !error) router.replace('/login')
  }, [loading, session, error, router])

  return { session, profile, loading, error }
}

export function useSignOut() {
  const router = useRouter()
  return async () => {
    clearStoredAuth()
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.disableAutoSelect()
    }
    router.replace('/login')
  }
}

// Usado por la pantalla de login para renderizar el botón "Iniciar sesión
// con Google" y resolver el perfil (hoja "Usuarios") cuando el usuario elige
// una cuenta.
export async function renderGoogleButton(
  container: HTMLElement,
  callbacks: { onSuccess: () => void; onError: (message: string) => void }
): Promise<void> {
  try {
    const google = await waitForGoogleIdentity()
    google.accounts.id.initialize({
      client_id: CONFIG.googleClientId,
      auto_select: false,
      callback: (response) => {
        establishFromIdToken(response.credential).then(callbacks.onSuccess).catch((err: Error) => callbacks.onError(err.message))
      },
    })
    google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', text: 'signin_with', width: 320 })
  } catch (err) {
    callbacks.onError((err as Error).message)
  }
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    // Errores acá (red caída, token corrupto en localStorage, bloqueo de un
    // extension/firewall) no deben dejar "loading" trabado para siempre: sin
    // esto la pantalla queda en blanco sin ningún mensaje.
    const loadProfile = async (userId: string) => {
      const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (!active) return
      if (profileError) throw profileError
      setProfile(data)
    }

    supabase.auth
      .getSession()
      .then(async ({ data, error: sessionError }) => {
        if (!active) return
        if (sessionError) throw sessionError
        setSession(data.session)
        if (data.session) await loadProfile(data.session.user.id)
      })
      .catch((err: Error) => {
        if (active) setError(err.message ?? 'No se pudo verificar la sesión.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!active) return
      setSession(newSession)
      setError(null)
      try {
        if (newSession) {
          await loadProfile(newSession.user.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        if (active) setError((err as Error).message ?? 'No se pudo cargar el perfil.')
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
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
    await supabase.auth.signOut()
    router.replace('/login')
  }
}

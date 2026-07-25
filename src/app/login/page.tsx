'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useSession } from '@/lib/auth'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Card from '@/components/ui/Card'
import TextField from '@/components/ui/TextField'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const { session, loading } = useSession()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && session) router.replace('/')
  }, [loading, session, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setSubmitting(false)
      return
    }

    router.replace('/')
  }

  if (loading || session) return null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Iniciar sesión</h1>
          <ThemeToggle />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            icon={<LogIn className="h-4 w-4" />}
            className="justify-center"
          >
            {submitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
      </Card>
    </main>
  )
}

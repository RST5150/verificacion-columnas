'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { renderGoogleButton, useSession } from '@/lib/auth'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  const { session, loading } = useSession()
  const router = useRouter()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && session) router.replace('/')
  }, [loading, session, router])

  useEffect(() => {
    if (loading || session || !buttonRef.current) return
    renderGoogleButton(buttonRef.current, {
      onSuccess: () => router.replace('/'),
      onError: (message) => setError(message),
    })
  }, [loading, session, router])

  if (loading || session) return null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Iniciar sesión</h1>
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div ref={buttonRef} />
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </Card>
    </main>
  )
}

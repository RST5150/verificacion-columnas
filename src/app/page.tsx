'use client'

import Link from 'next/link'
import { ClipboardPlus, ListChecks } from 'lucide-react'
import { useRequireAuth } from '@/lib/auth'
import UserBar from '@/components/auth/UserBar'
import AppHeader from '@/components/layout/AppHeader'

export default function Home() {
  const { session, profile, loading } = useRequireAuth()

  if (loading || !session) return null

  return (
    <>
      <AppHeader
        title="Verificación de columnas"
        actions={<UserBar email={session.user.email} profile={profile} />}
      />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
        <p className="text-foreground/70">
          Carga de datos de verificación mecánica y eléctrica de columnas de alumbrado público.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/ordenes/nueva"
            className="flex flex-col gap-3 rounded-fluent border border-border bg-surface p-6 shadow-sm transition-colors hover:border-accent hover:bg-surface-alt"
          >
            <ClipboardPlus className="h-8 w-8 text-accent" />
            <span className="text-base font-semibold text-foreground">Cargar nueva orden de servicio</span>
            <span className="text-sm text-foreground/60">Registrar una nueva inspección de columnas.</span>
          </Link>
          <Link
            href="/ordenes"
            className="flex flex-col gap-3 rounded-fluent border border-border bg-surface p-6 shadow-sm transition-colors hover:border-accent hover:bg-surface-alt"
          >
            <ListChecks className="h-8 w-8 text-accent" />
            <span className="text-base font-semibold text-foreground">Ver órdenes cargadas</span>
            <span className="text-sm text-foreground/60">Consultar y filtrar las órdenes existentes.</span>
          </Link>
        </div>
      </main>
    </>
  )
}

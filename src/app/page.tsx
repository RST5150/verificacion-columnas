'use client'

import Link from 'next/link'
import { useRequireAuth } from '@/lib/auth'
import UserBar from '@/components/auth/UserBar'

export default function Home() {
  const { session, profile, loading } = useRequireAuth()

  if (loading || !session) return null

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-start gap-6 p-10">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verificación de columnas</h1>
        <UserBar email={session.user.email} profile={profile} />
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        Carga de datos de verificación mecánica y eléctrica de columnas de alumbrado público.
      </p>
      <div className="flex gap-3">
        <Link
          href="/ordenes/nueva"
          className="rounded bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Cargar nueva orden de servicio
        </Link>
        <Link
          href="/ordenes"
          className="rounded border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Ver órdenes cargadas
        </Link>
      </div>
    </main>
  )
}

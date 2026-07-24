'use client'

import { useSignOut } from '@/lib/auth'
import ThemeToggle from '@/components/theme/ThemeToggle'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface Props {
  email: string | undefined
  profile: Profile | null
}

export default function UserBar({ email, profile }: Props) {
  const signOut = useSignOut()

  return (
    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
      <span>
        {email}
        {profile?.role === 'admin' && (
          <span className="ml-1 font-semibold text-blue-700 dark:text-blue-400">(admin)</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => signOut()}
        className="text-blue-700 hover:underline dark:text-blue-400"
      >
        Cerrar sesión
      </button>
      <ThemeToggle />
    </div>
  )
}

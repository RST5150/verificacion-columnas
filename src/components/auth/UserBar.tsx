'use client'

import { LogOut } from 'lucide-react'
import { useSignOut } from '@/lib/auth'
import ThemeToggle from '@/components/theme/ThemeToggle'
import Button from '@/components/ui/Button'
import type { Usuario } from '@/types/sheets'

type Profile = Usuario

interface Props {
  email: string | undefined
  profile: Profile | null
}

export default function UserBar({ email, profile }: Props) {
  const signOut = useSignOut()

  return (
    <div className="flex items-center gap-3 text-sm text-foreground/70">
      <span>
        {email}
        {profile?.role === 'admin' && <span className="ml-1 font-semibold text-accent">(admin)</span>}
      </span>
      <Button variant="ghost" icon={<LogOut className="h-4 w-4" />} onClick={() => signOut()}>
        Cerrar sesión
      </Button>
      <ThemeToggle />
    </div>
  )
}

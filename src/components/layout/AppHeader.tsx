import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  backHref?: string
  backLabel?: string
  actions?: ReactNode
}

export default function AppHeader({ title, backHref, backLabel, actions }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-6 py-4">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </header>
  )
}

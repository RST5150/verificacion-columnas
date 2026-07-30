'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'

interface Props {
  text: string
}

// Ícono de información con tooltip en hover/foco, para explicar cómo se
// calcula un KPI o gráfico junto a su título. El texto es siempre alcanzable
// por teclado (foco) además de con el mouse.
export default function InfoTooltip({ text }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex text-foreground/40 hover:text-accent focus:text-accent focus:outline-none"
        aria-label={text}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 w-56 -translate-x-1/2 rounded-fluent border border-border bg-surface px-2.5 py-2 text-xs font-normal normal-case text-foreground/80 shadow-md"
        >
          {text}
        </span>
      )}
    </span>
  )
}

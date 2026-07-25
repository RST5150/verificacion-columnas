import type { ReactNode } from 'react'

interface Props {
  title?: string
  children: ReactNode
  className?: string
}

export default function Card({ title, children, className = '' }: Props) {
  return (
    <section
      className={`rounded-fluent border border-border bg-surface p-5 shadow-sm ${className}`}
    >
      {title && <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>}
      {children}
    </section>
  )
}

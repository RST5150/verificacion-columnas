import type { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export default function Select({ label, className = '', children, ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm text-foreground/70">
      {label}
      <select
        className={`rounded-fluent border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}

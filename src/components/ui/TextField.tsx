import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export default function TextField({ label, className = '', ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm text-foreground/70">
      {label}
      <input
        className={`rounded-fluent border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent dark:[color-scheme:dark] ${className}`}
        {...rest}
      />
    </label>
  )
}

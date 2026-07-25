import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-accent-foreground hover:bg-accent-hover disabled:bg-border disabled:text-foreground/40',
  secondary:
    'border border-border bg-surface text-foreground hover:bg-surface-alt disabled:opacity-40',
  danger: 'text-danger hover:bg-danger-surface disabled:opacity-40',
  ghost: 'text-foreground hover:bg-surface-alt disabled:opacity-40',
}

export default function Button({ variant = 'secondary', icon, children, className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-fluent px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

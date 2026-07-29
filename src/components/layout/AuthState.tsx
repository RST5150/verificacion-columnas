interface Props {
  error: string | null
}

export default function AuthState({ error }: Props) {
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm rounded-fluent border border-danger bg-danger-surface p-5 text-center text-sm text-danger">
          <p className="font-semibold">No se pudo verificar la sesión</p>
          <p className="mt-1">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-3 font-semibold hover:underline">
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </main>
  )
}

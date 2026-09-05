import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password)

    if (error) {
      setError(error.message)
    } else if (mode === 'signup') {
      setMessage('Cuenta creada. Revisá tu email para confirmar.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="mb-8 text-3xl font-bold text-emerald-400">PlayDex</h1>
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md bg-slate-900 px-3 py-2.5 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md bg-slate-900 px-3 py-2.5 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-emerald-600 py-2.5 font-medium text-slate-950 disabled:opacity-50"
        >
          {loading
            ? 'Cargando...'
            : mode === 'signin'
              ? 'Iniciar sesión'
              : 'Crear cuenta'}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-sm text-slate-400"
        >
          {mode === 'signin'
            ? '¿No tenés cuenta? Registrate'
            : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </form>
    </div>
  )
}

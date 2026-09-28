import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PasswordInput } from '../components/PasswordInput'
import { useToast } from '../contexts/ToastContext'

const MIN_PASSWORD = 6

/** Se muestra al volver desde el link de "Olvidé mi contraseña". */
export function UpdatePassword({ onDone }: { onDone: () => void }) {
  const { updatePassword } = useAuth()
  const { showToast } = useToast()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await updatePassword(password)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    // Quitar el token de recuperación de la URL.
    window.history.replaceState(null, '', window.location.pathname)
    showToast('Contraseña actualizada')
    onDone()
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold text-ink">Nueva contraseña</h1>
      <p className="mb-6 mt-1 text-sm text-lavender">Elige una contraseña nueva para tu cuenta.</p>
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <PasswordInput
          required
          minLength={MIN_PASSWORD}
          autoComplete="new-password"
          placeholder={`Mínimo ${MIN_PASSWORD} caracteres`}
          aria-label="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="min-h-12 rounded-xl bg-primary font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  )
}

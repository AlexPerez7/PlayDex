import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

type ToastKind = 'success' | 'error'

interface ToastAction {
  label: string
  onClick: () => void
}

interface Toast {
  id: number
  kind: ToastKind
  message: string
  action?: ToastAction
}

interface ToastContextValue {
  showToast: (
    message: string,
    options?: { kind?: ToastKind; action?: ToastAction; duration?: number }
  ) => void
  /** Atajo para mostrar el mensaje de un error capturado. */
  showError: (err: unknown, fallback?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 3500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback<ToastContextValue['showToast']>(
    (message, options = {}) => {
      const id = ++nextId.current
      const toast: Toast = { id, message, kind: options.kind ?? 'success', action: options.action }
      // Máximo 3 en pantalla: en mobile no hay lugar para más.
      setToasts((prev) => [...prev.slice(-2), toast])
      setTimeout(() => dismiss(id), options.duration ?? DEFAULT_DURATION)
    },
    [dismiss]
  )

  const showError = useCallback<ToastContextValue['showError']>(
    (err, fallback = 'Ocurrió un error') => {
      const message = err instanceof Error && err.message ? err.message : fallback
      showToast(message, { kind: 'error', duration: 5000 })
    },
    [showToast]
  )

  const value = useMemo(() => ({ showToast, showError }), [showToast, showError])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
        style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
      >
        {toasts.map((t) => {
          const Icon = t.kind === 'error' ? AlertCircle : CheckCircle2
          return (
            <div
              key={t.id}
              role={t.kind === 'error' ? 'alert' : 'status'}
              className="toast-in pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-background-surface px-4 py-3 text-sm text-ink shadow-lg shadow-black/50 ring-1 ring-primary-dark/40"
            >
              <Icon
                size={18}
                className={`flex-shrink-0 ${t.kind === 'error' ? 'text-error' : 'text-accent'}`}
              />
              <span className="min-w-0 flex-1">{t.message}</span>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action?.onClick()
                    dismiss(t.id)
                  }}
                  className="-my-2 -mr-2 flex-shrink-0 rounded-xl px-3 py-2 font-semibold text-accent active:bg-primary-dark/20"
                >
                  {t.action.label}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

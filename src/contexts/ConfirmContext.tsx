import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { BottomSheet } from '../components/BottomSheet'

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  /** Acción destructiva: botón en rojo. */
  danger?: boolean
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * Reemplazo de `window.confirm()` como hoja inferior: en mobile el diálogo
 * nativo se ve fuera de lugar, bloquea el hilo y en algunas PWA de iOS ni
 * siquiera aparece.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    // Si había una confirmación abierta, se da por cancelada.
    resolver.current?.(false)
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = useCallback((result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setOptions(null)
  }, [])

  const handleCancel = useCallback(() => close(false), [close])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <BottomSheet open={options != null} onClose={handleCancel} title={options?.title ?? ''}>
        {options?.message && <p className="mb-5 text-sm text-lavender">{options.message}</p>}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => close(true)}
            className={`min-h-12 rounded-xl font-semibold ${
              options?.danger ? 'bg-error text-white' : 'bg-primary text-white'
            }`}
          >
            {options?.confirmLabel ?? 'Confirmar'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="min-h-12 rounded-xl font-medium text-lavender active:bg-primary-dark/20"
          >
            Cancelar
          </button>
        </div>
      </BottomSheet>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>')
  return ctx
}

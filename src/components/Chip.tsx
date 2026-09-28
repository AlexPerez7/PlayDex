import type { ReactNode } from 'react'

interface ChipProps {
  active: boolean
  onClick: () => void
  children: ReactNode
  /** Clases para el estado activo (por defecto, acento). */
  activeClassName?: string
  /** Fondo del estado inactivo (sobre tarjetas se usa uno más oscuro). */
  inactiveClassName?: string
  className?: string
}

/**
 * Chip seleccionable. Se ve compacto (32 px de alto) pero el área táctil se
 * extiende con un pseudo-elemento invisible hasta ~44 px, el mínimo
 * recomendado para dedos.
 */
export function Chip({
  active,
  onClick,
  children,
  activeClassName = 'bg-accent text-primary-darker',
  inactiveClassName = 'bg-background-surface text-lavender ring-1 ring-primary-dark/30 active:bg-primary-dark/20',
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-sm transition-colors after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] ${
        active ? activeClassName : inactiveClassName
      } ${className}`}
    >
      {children}
    </button>
  )
}

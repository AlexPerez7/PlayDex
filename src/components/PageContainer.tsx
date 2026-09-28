import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  /**
   * La página empieza debajo de una portada a sangre (detalle de juego): el
   * margen superior del notch ya lo maneja la portada.
   */
  belowHero?: boolean
}

export function PageContainer({ children, belowHero = false }: PageContainerProps) {
  return (
    <div
      className={`mx-auto max-w-md px-4 pb-safe-nav md:max-w-3xl lg:max-w-5xl ${
        belowHero ? 'pt-4' : 'pt-safe-6'
      }`}
    >
      {children}
    </div>
  )
}

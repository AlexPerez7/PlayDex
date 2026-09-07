import { useState } from 'react'

interface GameThumbProps {
  src: string | null
  alt: string
  /** URLs alternativas a probar, en orden, si `src` falla. */
  fallbacks?: string[]
  /** Clases para la imagen y para el placeholder (mismo tamaño). */
  className?: string
  /** Clases extra solo para el placeholder (ej. tamaño del emoji). */
  placeholderClassName?: string
}

/**
 * Portada de un juego con degradado: prueba `src`, luego cada `fallback`, y si
 * todo falla muestra un placeholder. Necesario sobre todo para Steam: algunas
 * apps (títulos de EA, lanzamientos muy nuevos) no tienen `header.jpg` en el
 * CDN y devuelven 404.
 */
export function GameThumb({
  src,
  alt,
  fallbacks = [],
  className = '',
  placeholderClassName = '',
}: GameThumbProps) {
  const chain = src ? [src, ...fallbacks] : []
  const [index, setIndex] = useState(0)

  if (index >= chain.length) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800 ${className} ${placeholderClassName}`}
      >
        🎮
      </div>
    )
  }

  return (
    <img
      key={chain[index]}
      src={chain[index]}
      alt={alt}
      loading="lazy"
      onError={() => setIndex((i) => i + 1)}
      className={className}
    />
  )
}

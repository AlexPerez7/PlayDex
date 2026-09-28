import { Ban, Bookmark, Gamepad2, Layers, Pause, Trophy, type LucideIcon } from 'lucide-react'
import type { GameStatus } from '../types/game'

/** Orden "de vida" de un juego: se desea, se tiene, se juega, se termina. */
export const statuses: GameStatus[] = [
  'deseado',
  'pendiente',
  'jugando',
  'en_pausa',
  'completado',
  'abandonado',
]

export const statusLabels: Record<GameStatus, string> = {
  deseado: 'Deseado',
  pendiente: 'Pendiente',
  jugando: 'Jugando',
  completado: 'Completado',
  abandonado: 'Abandonado',
  en_pausa: 'En pausa',
}

export const statusColors: Record<GameStatus, string> = {
  deseado: 'bg-warning/15 text-warning ring-1 ring-warning/40',
  pendiente: 'bg-primary-dark/40 text-lavender',
  jugando: 'bg-accent text-primary-darker',
  completado: 'bg-lavender text-primary-darker',
  abandonado: 'bg-background-surface text-lavender ring-1 ring-primary-dark',
  en_pausa: 'bg-primary text-white',
}

export const statusIcons: Record<GameStatus, LucideIcon> = {
  deseado: Bookmark,
  pendiente: Layers,
  jugando: Gamepad2,
  completado: Trophy,
  abandonado: Ban,
  en_pausa: Pause,
}

/** Estados en los que tiene sentido mostrar precios de tiendas. */
export function showsDeals(status: GameStatus) {
  return status === 'deseado' || status === 'pendiente'
}

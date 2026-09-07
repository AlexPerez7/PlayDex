import { Ban, Gamepad2, Layers, Pause, Trophy, type LucideIcon } from 'lucide-react'
import type { GameStatus } from '../types/game'

export const statuses: GameStatus[] = [
  'pendiente',
  'jugando',
  'completado',
  'abandonado',
  'en_pausa',
]

export const statusLabels: Record<GameStatus, string> = {
  pendiente: 'Pendiente',
  jugando: 'Jugando',
  completado: 'Completado',
  abandonado: 'Abandonado',
  en_pausa: 'En pausa',
}

export const statusColors: Record<GameStatus, string> = {
  pendiente: 'bg-primary-dark/40 text-lavender',
  jugando: 'bg-accent text-primary-darker',
  completado: 'bg-lavender text-primary-darker',
  abandonado: 'bg-background-surface text-lavender ring-1 ring-primary-dark',
  en_pausa: 'bg-primary text-white',
}

export const statusIcons: Record<GameStatus, LucideIcon> = {
  pendiente: Layers,
  jugando: Gamepad2,
  completado: Trophy,
  abandonado: Ban,
  en_pausa: Pause,
}

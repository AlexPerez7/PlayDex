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
  pendiente: 'bg-slate-700 text-slate-200',
  jugando: 'bg-emerald-700 text-emerald-100',
  completado: 'bg-blue-700 text-blue-100',
  abandonado: 'bg-red-800 text-red-100',
  en_pausa: 'bg-amber-700 text-amber-100',
}

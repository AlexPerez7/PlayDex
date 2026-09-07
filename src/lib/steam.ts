import { supabase } from './supabaseClient'
import type { NewGame } from '../types/game'

export interface SteamGame {
  appid: number
  name: string
  hours_played: number
  cover_url: string
}

export async function getSteamLibrary(): Promise<SteamGame[]> {
  const { data, error } = await supabase.functions.invoke<SteamGame[]>('steam-library')
  if (error) throw error
  return data ?? []
}

export function steamGameToNewGame(game: SteamGame): NewGame {
  return {
    title: game.name,
    platform: 'PC',
    status: game.hours_played > 0 ? 'jugando' : 'pendiente',
    hours_played: game.hours_played,
    cover_url: game.cover_url,
    steam_appid: game.appid,
  }
}

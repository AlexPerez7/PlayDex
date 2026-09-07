import { supabase } from './supabaseClient'
import type { IgdbSearchResult, NewGame, TimeToBeat } from '../types/game'

export async function searchGames(query: string): Promise<IgdbSearchResult[]> {
  const { data, error } = await supabase.functions.invoke<IgdbSearchResult[]>(
    'igdb-search',
    { body: { query } }
  )

  if (error) throw error
  return data ?? []
}

export async function getPopularGames(): Promise<IgdbSearchResult[]> {
  const { data, error } = await supabase.functions.invoke<IgdbSearchResult[]>(
    'igdb-search',
    { body: { mode: 'popular' } }
  )

  if (error) throw error
  return data ?? []
}

/**
 * Duración estimada de un juego (endpoint oficial game_time_to_beats de IGDB).
 * Pasa `igdbId` cuando lo tengas; si no, `title` y la función lo resuelve
 * buscando por texto. Devuelve null si IGDB no tiene tiempos cargados.
 */
export async function getTimeToBeat(params: {
  igdbId?: number | null
  title?: string
}): Promise<TimeToBeat | null> {
  const { data, error } = await supabase.functions.invoke<TimeToBeat | null>(
    'igdb-search',
    {
      body: {
        mode: 'timeToBeat',
        igdbId: params.igdbId ?? undefined,
        title: params.title,
      },
    }
  )

  if (error) throw error
  return data ?? null
}

export function igdbResultToNewGame(result: IgdbSearchResult): NewGame {
  return {
    title: result.name,
    cover_url: result.cover_url,
    genre: result.genres.join(', '),
    platform: result.platforms.join(', '),
    summary: result.summary ?? '',
    first_release_date: result.first_release_date ?? undefined,
    igdb_id: result.id,
    status: 'pendiente',
  }
}

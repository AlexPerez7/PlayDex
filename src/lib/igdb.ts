import { supabase } from './supabaseClient'
import type { IgdbSearchResult, NewGame } from '../types/game'

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

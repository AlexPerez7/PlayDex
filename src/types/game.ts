export type GameStatus =
  | 'pendiente'
  | 'jugando'
  | 'completado'
  | 'abandonado'
  | 'en_pausa'

export interface Game {
  id: string
  user_id: string
  igdb_id: number | null
  title: string
  platform: string | null
  status: GameStatus
  hours_played: number
  rating: number | null
  cover_url: string | null
  genre: string | null
  notes: string | null
  date_started: string | null
  date_finished: string | null
  created_at: string
}

export type NewGame = Pick<Game, 'title'> &
  Partial<
    Omit<Game, 'id' | 'user_id' | 'created_at' | 'title'>
  >

export interface PlaySession {
  id: string
  game_id: string
  duration_minutes: number
  played_at: string
  notes: string | null
}

export interface IgdbSearchResult {
  id: number
  name: string
  cover_url: string | null
  genres: string[]
  platforms: string[]
  first_release_date: number | null
  summary: string | null
}

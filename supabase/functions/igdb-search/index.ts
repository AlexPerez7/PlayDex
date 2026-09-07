// Edge Function: proxy hacia IGDB.
// Secrets requeridos (nunca en el frontend):
//   supabase secrets set TWITCH_CLIENT_ID=xxx TWITCH_CLIENT_SECRET=xxx
//
// Modos (campo `mode` en el body):
//   - (default)      -> búsqueda por texto (`query`)
//   - "popular"      -> juegos con más hype de los últimos 2 años
//   - "timeToBeat"   -> duración estimada (`igdbId` y/o `title`), vía el
//                       endpoint oficial game_time_to_beats. Reemplaza al viejo
//                       scraping de HowLongToBeat, que dependía de un endpoint
//                       interno no documentado.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/http.ts'

const TWITCH_CLIENT_ID = Deno.env.get('TWITCH_CLIENT_ID')!
const TWITCH_CLIENT_SECRET = Deno.env.get('TWITCH_CLIENT_SECRET')!

interface CachedToken {
  token: string
  expiresAt: number
}

let cachedToken: CachedToken | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials',
  })

  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, {
    method: 'POST',
  })

  if (!res.ok) {
    throw new Error(`No se pudo obtener token de Twitch: ${res.status}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    // Renovar 5 minutos antes de que expire
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }
  return cachedToken.token
}

/** POST a un endpoint de IGDB con el body en formato Apicalypse. */
async function igdb(endpoint: string, body: string): Promise<unknown> {
  const token = await getAccessToken()
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error de IGDB (${res.status}): ${text}`)
  }
  return res.json()
}

interface IgdbGame {
  id: number
  name: string
  cover?: { url: string }
  genres?: { name: string }[]
  platforms?: { name: string }[]
  first_release_date?: number
  summary?: string
}

function mapGames(games: IgdbGame[]) {
  return games.map((g) => ({
    id: g.id,
    name: g.name,
    cover_url: g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : null,
    genres: g.genres?.map((genre) => genre.name) ?? [],
    platforms: g.platforms?.map((p) => p.name) ?? [],
    first_release_date: g.first_release_date ?? null,
    summary: g.summary ?? null,
  }))
}

const GAME_FIELDS =
  'fields name, cover.url, genres.name, platforms.name, first_release_date, summary;'

async function searchByText(query: string) {
  const body = `search "${query.replace(/"/g, '\\"')}";
${GAME_FIELDS}
limit 10;`
  const games = (await igdb('games', body)) as IgdbGame[]
  return mapGames(games)
}

async function popular() {
  const twoYearsAgo = Math.floor(Date.now() / 1000) - 2 * 365 * 24 * 60 * 60
  const body = `fields name, cover.url, genres.name, platforms.name, first_release_date, summary, hypes;
sort hypes desc;
where hypes != null & first_release_date > ${twoYearsAgo};
limit 10;`
  const games = (await igdb('games', body)) as IgdbGame[]
  return mapGames(games)
}

interface TimeToBeatRow {
  game_id: number
  hastily?: number
  normally?: number
  completely?: number
  count?: number
}

/** Segundos -> horas con 1 decimal, o null si no hay dato. */
function toHours(seconds?: number): number | null {
  if (!seconds || seconds <= 0) return null
  return Math.round((seconds / 3600) * 10) / 10
}

async function timeToBeat(igdbId?: number, title?: string) {
  // Necesitamos el id numérico de IGDB. Si no vino (juego importado de Steam o
  // agregado a mano), lo resolvemos buscando por título.
  let gameId = igdbId
  if (!gameId && title) {
    const body = `search "${title.replace(/"/g, '\\"')}";
fields id;
limit 1;`
    const hits = (await igdb('games', body)) as { id: number }[]
    gameId = hits[0]?.id
  }
  if (!gameId) return null

  const rows = (await igdb(
    'game_time_to_beats',
    `fields game_id, hastily, normally, completely, count;
where game_id = ${gameId};
limit 1;`
  )) as TimeToBeatRow[]

  const row = rows[0]
  if (!row) return null

  const result = {
    hastilyHours: toHours(row.hastily),
    normallyHours: toHours(row.normally),
    completelyHours: toHours(row.completely),
    count: row.count ?? 0,
  }
  // Si IGDB no tiene ningún tiempo cargado, tratamos como "sin dato".
  if (
    result.hastilyHours == null &&
    result.normallyHours == null &&
    result.completelyHours == null
  ) {
    return null
  }
  return result
}

serve(async (req) => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  try {
    const { query, mode, igdbId, title } = await req.json().catch(() => ({}))

    if (mode === 'popular') {
      return jsonResponse(await popular())
    }

    if (mode === 'timeToBeat') {
      return jsonResponse(await timeToBeat(igdbId, title))
    }

    if (!query || typeof query !== 'string') {
      return jsonResponse({ error: 'Falta el parámetro query' }, 400)
    }

    return jsonResponse(await searchByText(query))
  } catch (err) {
    return errorResponse(err)
  }
})

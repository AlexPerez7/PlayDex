// Edge Function: proxy de búsqueda hacia IGDB.
// Secrets requeridos (nunca en el frontend):
//   supabase secrets set TWITCH_CLIENT_ID=xxx TWITCH_CLIENT_SECRET=xxx
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

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

interface IgdbGame {
  id: number
  name: string
  cover?: { url: string }
  genres?: { name: string }[]
  platforms?: { name: string }[]
  first_release_date?: number
  summary?: string
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Falta el parámetro query' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = await getAccessToken()

    const body = `search "${query.replace(/"/g, '\\"')}";
fields name, cover.url, genres.name, platforms.name, first_release_date, summary;
limit 10;`

    const igdbRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body,
    })

    if (!igdbRes.ok) {
      const text = await igdbRes.text()
      throw new Error(`Error de IGDB (${igdbRes.status}): ${text}`)
    }

    const games: IgdbGame[] = await igdbRes.json()

    const results = games.map((g) => ({
      id: g.id,
      name: g.name,
      cover_url: g.cover?.url ? `https:${g.cover.url.replace('t_thumb', 't_cover_big')}` : null,
      genres: g.genres?.map((genre) => genre.name) ?? [],
      platforms: g.platforms?.map((p) => p.name) ?? [],
      first_release_date: g.first_release_date ?? null,
      summary: g.summary ?? null,
    }))

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Error desconocido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

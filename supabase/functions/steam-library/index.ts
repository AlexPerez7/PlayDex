// Edge Function: trae la biblioteca de Steam del usuario (juegos + horas jugadas).
// El SteamID64 se lee de la fila `profiles` del usuario que llama (vinculada
// antes vía la función steam-auth / "Sign in through Steam").
// Secret requerido:
//   supabase secrets set STEAM_API_KEY=xxx
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/http.ts'
import { userClient } from '../_shared/supabase.ts'

const STEAM_API_KEY = Deno.env.get('STEAM_API_KEY')!

interface SteamGame {
  appid: number
  name: string
  playtime_forever: number
}

serve(async (req) => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  try {
    const supa = userClient(req)
    const {
      data: { user },
    } = await supa.auth.getUser()
    if (!user) return jsonResponse({ error: 'No autenticado.' }, 401)

    const { data: profile } = await supa
      .from('profiles')
      .select('steam_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const steamId = profile?.steam_id
    if (!steamId) {
      return jsonResponse(
        { error: 'Conectá tu cuenta de Steam primero.' },
        400
      )
    }

    const params = new URLSearchParams({
      key: STEAM_API_KEY,
      steamid: steamId,
      include_appinfo: '1',
      include_played_free_games: '1',
      format: 'json',
    })

    const res = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?${params}`
    )
    if (!res.ok) {
      throw new Error(`Error de Steam (${res.status})`)
    }

    const data = await res.json()
    const games: SteamGame[] = data.response?.games ?? []

    if (games.length === 0) {
      throw new Error(
        'Steam no devolvió juegos. Revisá que en la privacidad de tu perfil de Steam, "Mi perfil" y "Detalles del juego" estén en Público.'
      )
    }

    const results = games
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .map((g) => ({
        appid: g.appid,
        name: g.name.trim(),
        hours_played: Math.round((g.playtime_forever / 60) * 10) / 10,
        cover_url: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      }))

    return jsonResponse(results)
  } catch (err) {
    return errorResponse(err)
  }
})

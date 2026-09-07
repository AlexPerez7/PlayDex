// Edge Function: trae la biblioteca de Steam del usuario (juegos + horas jugadas).
// Secrets requeridos (nunca en el frontend):
//   supabase secrets set STEAM_API_KEY=xxx STEAM_ID=xxx
// STEAM_ID puede ser el SteamID64 numerico o el nombre de la URL personalizada
// (ej. "Alekay7" de steamcommunity.com/id/Alekay7) - se resuelve automaticamente.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/http.ts'

const STEAM_API_KEY = Deno.env.get('STEAM_API_KEY')!
const STEAM_ID_OR_VANITY = Deno.env.get('STEAM_ID')!

interface SteamGame {
  appid: number
  name: string
  playtime_forever: number
}

async function resolveSteamId(): Promise<string> {
  if (/^\d+$/.test(STEAM_ID_OR_VANITY)) {
    return STEAM_ID_OR_VANITY
  }
  const params = new URLSearchParams({
    key: STEAM_API_KEY,
    vanityurl: STEAM_ID_OR_VANITY,
  })
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?${params}`
  )
  if (!res.ok) throw new Error(`No se pudo resolver el usuario de Steam (${res.status})`)
  const data = await res.json()
  if (data.response?.success !== 1) {
    throw new Error('No se encontro ese usuario de Steam. Revisa STEAM_ID.')
  }
  return data.response.steamid as string
}

serve(async (req) => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  try {
    const steamId = await resolveSteamId()

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
        'Steam no devolvio juegos. Revisa que el perfil (o al menos "Detalles del juego") este publico.'
      )
    }

    const results = games
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .map((g) => ({
        appid: g.appid,
        name: g.name.trim(),
        hours_played: Math.round((g.playtime_forever / 60) * 10) / 10,
        cover_url: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      }))

    return jsonResponse(results)
  } catch (err) {
    return errorResponse(err)
  }
})

import { supabase } from './supabaseClient'
import type { NewGame } from '../types/game'

export interface SteamGame {
  appid: number
  name: string
  hours_played: number
  cover_url: string
}

export interface SteamProfile {
  steam_id: string
  steam_persona: string | null
  steam_avatar: string | null
  /** Solo lo sabemos al vincular; undefined si se cargó desde la DB. */
  is_public?: boolean
}

/** Invoca una Edge Function y extrae el mensaje de error real del cuerpo. */
async function callFn<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body })
  if (!error) return data as T

  let message = error.message
  const ctx = (error as { context?: Response }).context
  if (ctx && typeof ctx.json === 'function') {
    try {
      const parsed = await ctx.json()
      if (parsed?.error) message = parsed.error
    } catch {
      /* el cuerpo no era JSON, dejamos el mensaje genérico */
    }
  }
  throw new Error(message)
}

/** Perfil de Steam vinculado del usuario actual, o null si no vinculó ninguno. */
export async function getSteamProfile(): Promise<SteamProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('steam_id, steam_persona, steam_avatar')
    .eq('user_id', user.id)
    .maybeSingle()

  return data?.steam_id ? (data as SteamProfile) : null
}

/** Devuelve la URL de Steam a la que hay que redirigir el navegador. */
export async function startSteamLogin(): Promise<string> {
  const returnTo = `${window.location.origin}/steam-import/callback`
  const { url } = await callFn<{ url: string }>('steam-auth', {
    action: 'start',
    returnTo,
  })
  return url
}

/** Valida la vuelta de Steam (query string con los openid.*) y guarda el perfil. */
export async function verifySteamLogin(search: string): Promise<SteamProfile> {
  const params = Object.fromEntries(new URLSearchParams(search))
  const res = await callFn<{
    steamId: string
    persona: string | null
    avatar: string | null
    isPublic: boolean
  }>('steam-auth', { action: 'verify', params })

  return {
    steam_id: res.steamId,
    steam_persona: res.persona,
    steam_avatar: res.avatar,
    is_public: res.isPublic,
  }
}

export async function disconnectSteam(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('profiles')
    .update({ steam_id: null, steam_persona: null, steam_avatar: null })
    .eq('user_id', user.id)
}

export async function getSteamLibrary(): Promise<SteamGame[]> {
  return (await callFn<SteamGame[]>('steam-library')) ?? []
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

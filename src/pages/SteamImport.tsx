import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  disconnectSteam,
  getSteamLibrary,
  getSteamProfile,
  startSteamLogin,
  steamGameToNewGame,
  type SteamGame,
  type SteamProfile,
} from '../lib/steam'
import { useGames } from '../hooks/useGames'
import { PageContainer } from '../components/PageContainer'
import { PopularCardSkeleton } from '../components/Skeleton'
import { GameThumb } from '../components/GameThumb'

function PrivacyNote() {
  return (
    <div className="rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-400 ring-1 ring-slate-800">
      <p className="mb-1 font-medium text-slate-300">Requisitos</p>
      <ul className="list-disc space-y-1 pl-4">
        <li>
          Tu perfil de Steam debe estar <strong>público</strong>: en Steam →
          Perfil → Editar perfil → Privacidad, poné <em>Mi perfil</em> y{' '}
          <em>Detalles del juego</em> en <strong>Público</strong>.
        </li>
        <li>
          Revisá que <em>"Mantener siempre privado mi total de horas jugadas"</em>{' '}
          esté desactivado, si querés que se importen las horas.
        </li>
        <li>
          Solo leemos tu lista de juegos y horas jugadas. No publicamos nada ni
          modificamos tu cuenta de Steam.
        </li>
      </ul>
    </div>
  )
}

export function SteamImport() {
  const navigate = useNavigate()
  const { games, addGame } = useGames()

  const [profile, setProfile] = useState<SteamProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const [library, setLibrary] = useState<SteamGame[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingAppId, setAddingAppId] = useState<number | null>(null)

  useEffect(() => {
    getSteamProfile()
      .then(setProfile)
      .finally(() => setProfileLoading(false))
  }, [])

  useEffect(() => {
    if (!profile) return
    setLibraryLoading(true)
    setError(null)
    getSteamLibrary()
      .then(setLibrary)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error cargando tu biblioteca de Steam')
      )
      .finally(() => setLibraryLoading(false))
  }, [profile])

  async function handleConnect() {
    setConnecting(true)
    try {
      window.location.href = await startSteamLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el login de Steam')
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    await disconnectSteam()
    setProfile(null)
    setLibrary([])
    setError(null)
  }

  const importedAppIds = new Set(
    games.map((g) => g.steam_appid).filter((id): id is number => id != null)
  )

  async function handleImport(game: SteamGame) {
    setAddingAppId(game.appid)
    try {
      await addGame(steamGameToNewGame(game))
    } finally {
      setAddingAppId(null)
    }
  }

  return (
    <PageContainer>
      <button onClick={() => navigate('/add')} className="mb-4 text-sm text-emerald-400">
        ← Volver
      </button>

      <h1 className="mb-1 text-xl font-semibold">Importar de Steam</h1>
      <p className="mb-4 text-sm text-slate-400">
        Vinculá tu cuenta de Steam para traer tus juegos con las horas jugadas reales.
      </p>

      {/* --- Sin cuenta vinculada --- */}
      {!profileLoading && !profile && (
        <div className="flex flex-col gap-4">
          <PrivacyNote />
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="rounded-md bg-[#1b2838] px-4 py-3 text-sm font-medium text-white ring-1 ring-slate-700 disabled:opacity-50"
          >
            {connecting ? 'Redirigiendo a Steam...' : 'Iniciar sesión con Steam'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}

      {/* --- Cuenta vinculada --- */}
      {profile && (
        <>
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-800">
            {profile.steam_avatar && (
              <img
                src={profile.steam_avatar}
                alt=""
                className="h-9 w-9 rounded"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-200">
                {profile.steam_persona ?? 'Cuenta de Steam'}
              </p>
              <p className="text-xs text-slate-500">Vinculada</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="flex-shrink-0 text-xs text-slate-400 underline"
            >
              Desvincular
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-300 ring-1 ring-red-900">
              <p>{error}</p>
              <div className="mt-2 text-red-300/80">
                <PrivacyNote />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {libraryLoading &&
              Array.from({ length: 6 }).map((_, i) => <PopularCardSkeleton key={i} />)}

            {!libraryLoading &&
              library.map((game) => {
                const imported = importedAppIds.has(game.appid)
                return (
                  <div
                    key={game.appid}
                    className="flex items-center gap-3 rounded-lg bg-slate-900 p-2 ring-1 ring-slate-800"
                  >
                    <GameThumb
                      src={game.cover_url}
                      alt={game.name}
                      fallbacks={[
                        `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_hero.jpg`,
                      ]}
                      className="h-12 w-24 flex-shrink-0 rounded object-cover"
                      placeholderClassName="text-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-100">
                        {game.name}
                      </p>
                      <p className="text-xs text-slate-500">{game.hours_played}h jugadas</p>
                    </div>
                    <button
                      onClick={() => handleImport(game)}
                      disabled={imported || addingAppId === game.appid}
                      className="flex-shrink-0 rounded-md bg-emerald-700 px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
                    >
                      {imported
                        ? 'Importado'
                        : addingAppId === game.appid
                          ? '...'
                          : '+ Agregar'}
                    </button>
                  </div>
                )
              })}
          </div>

          {!libraryLoading && !error && library.length === 0 && (
            <p className="text-sm text-slate-400">Tu biblioteca de Steam está vacía.</p>
          )}
        </>
      )}
    </PageContainer>
  )
}

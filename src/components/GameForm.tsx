import { useState } from 'react'
import { searchGames } from '../lib/igdb'
import type { GameStatus, IgdbSearchResult, NewGame } from '../types/game'

const statuses: GameStatus[] = [
  'pendiente',
  'jugando',
  'completado',
  'abandonado',
  'en_pausa',
]

interface GameFormProps {
  onSubmit: (game: NewGame) => Promise<void>
}

export function GameForm({ onSubmit }: GameFormProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<IgdbSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<NewGame>({
    title: '',
    platform: '',
    status: 'pendiente',
    genre: '',
    cover_url: '',
    igdb_id: undefined,
  })

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    try {
      const data = await searchGames(query.trim())
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error buscando en IGDB')
    } finally {
      setSearching(false)
    }
  }

  function applyResult(result: IgdbSearchResult) {
    setForm((prev) => ({
      ...prev,
      title: result.name,
      cover_url: result.cover_url,
      genre: result.genres[0] ?? '',
      igdb_id: result.id,
    }))
    setResults([])
    setQuery(result.name)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit(form)
      setForm({
        title: '',
        platform: '',
        status: 'pendiente',
        genre: '',
        cover_url: '',
        igdb_id: undefined,
      })
      setQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm text-slate-400">
          Buscar en IGDB
        </label>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre del juego..."
            className="flex-1 rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {searching ? '...' : 'Buscar'}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-md bg-slate-900 p-2 ring-1 ring-slate-800">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => applyResult(r)}
                  className="flex w-full items-center gap-2 rounded p-2 text-left text-sm hover:bg-slate-800"
                >
                  {r.cover_url && (
                    <img
                      src={r.cover_url}
                      alt={r.name}
                      className="h-10 w-8 rounded object-cover"
                    />
                  )}
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Título *</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Plataforma
          </label>
          <input
            value={form.platform ?? ''}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Estado</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as GameStatus })
            }
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Género</label>
        <input
          value={form.genre ?? ''}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-emerald-600 py-2.5 font-medium text-slate-950 disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar juego'}
      </button>
    </form>
  )
}

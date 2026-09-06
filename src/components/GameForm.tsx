import { useState } from 'react'
import { igdbResultToNewGame, searchGames } from '../lib/igdb'
import { PlatformPicker } from './PlatformPicker'
import { StatusPicker } from './StatusPicker'
import { TagList } from './TagList'
import type { GameStatus, IgdbSearchResult, NewGame } from '../types/game'

const emptyForm: NewGame = {
  title: '',
  platform: '',
  status: 'pendiente',
  genre: '',
  cover_url: '',
  igdb_id: undefined,
  summary: '',
  first_release_date: undefined,
}

interface GameFormProps {
  onSubmit: (game: NewGame) => Promise<void>
  existingIgdbIds?: Set<number>
}

export function GameForm({ onSubmit, existingIgdbIds }: GameFormProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<IgdbSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<NewGame>(emptyForm)

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
    setForm((prev) => ({ ...prev, ...igdbResultToNewGame(result) }))
    setResults([])
    setQuery('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit(form)
      setForm(emptyForm)
      setQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const owned = form.igdb_id != null && existingIgdbIds?.has(form.igdb_id)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Buscar en IGDB
        </label>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            placeholder="Nombre del juego..."
            className="min-w-0 flex-1 rounded-md bg-slate-900 px-3 py-2.5 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="flex-shrink-0 rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-lg bg-slate-900 p-2 ring-1 ring-slate-800">
            {results.map((r) => {
              const resultOwned = existingIgdbIds?.has(r.id)
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => applyResult(r)}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm active:bg-slate-800"
                  >
                    <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-slate-800">
                      {r.cover_url && (
                        <img
                          src={r.cover_url}
                          alt={r.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-100">{r.name}</p>
                      {r.first_release_date && (
                        <p className="text-xs text-slate-500">
                          {new Date(r.first_release_date * 1000).getFullYear()}
                        </p>
                      )}
                    </div>
                    {resultOwned && (
                      <span className="flex-shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-emerald-400">
                        ya en tu biblioteca
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {form.cover_url && (
        <div className="flex gap-3 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-800">
          <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded bg-slate-800">
            <img
              src={form.cover_url}
              alt={form.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-100">{form.title}</p>
            {form.first_release_date && (
              <p className="text-sm text-slate-500">
                {new Date(form.first_release_date * 1000).getFullYear()}
              </p>
            )}
            <div className="mt-1.5">
              <TagList value={form.genre} />
            </div>
            {owned && (
              <p className="mt-1.5 text-xs text-amber-400">
                Ya está en tu biblioteca. Puedes agregarlo igual si quieres otra copia.
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Título *</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-md bg-slate-900 px-3 py-2.5 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">
          Plataforma(s)
        </label>
        <PlatformPicker
          value={form.platform}
          onChange={(platform) => setForm({ ...form, platform })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Estado</label>
        <StatusPicker
          value={form.status ?? 'pendiente'}
          onChange={(status: GameStatus) => setForm({ ...form, status })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-300">Género</label>
        <input
          value={form.genre ?? ''}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          placeholder="Separa varios con coma"
          className="w-full rounded-md bg-slate-900 px-3 py-2.5 text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving || !form.title.trim()}
        className="rounded-md bg-emerald-600 py-3 font-medium text-slate-950 disabled:opacity-40"
      >
        {saving ? 'Guardando...' : 'Guardar juego'}
      </button>
    </form>
  )
}

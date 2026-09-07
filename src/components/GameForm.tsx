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
        <label className="mb-1 block text-sm font-medium text-lavender">
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
            className="min-w-0 flex-1 rounded-md bg-background-surface px-3 py-2.5 text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="flex-shrink-0 rounded-md bg-primary px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto rounded-lg bg-background-surface p-2 ring-1 ring-primary-dark/30">
            {results.map((r) => {
              const resultOwned = existingIgdbIds?.has(r.id)
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => applyResult(r)}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm active:bg-primary-dark/20"
                  >
                    <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-primary-dark/20">
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
                      <p className="truncate font-medium text-ink">{r.name}</p>
                      {r.first_release_date && (
                        <p className="text-xs text-lavender">
                          {new Date(r.first_release_date * 1000).getFullYear()}
                        </p>
                      )}
                    </div>
                    {resultOwned && (
                      <span className="flex-shrink-0 rounded-full bg-primary-dark/20 px-2 py-0.5 text-xs text-accent">
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
        <div className="flex gap-3 rounded-lg bg-background-surface p-3 ring-1 ring-primary-dark/30">
          <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded bg-primary-dark/20">
            <img
              src={form.cover_url}
              alt={form.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink">{form.title}</p>
            {form.first_release_date && (
              <p className="text-sm text-lavender">
                {new Date(form.first_release_date * 1000).getFullYear()}
              </p>
            )}
            <div className="mt-1.5">
              <TagList value={form.genre} />
            </div>
            {owned && (
              <p className="mt-1.5 text-xs text-warning">
                Ya está en tu biblioteca. Puedes agregarlo igual si quieres otra copia.
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-lavender">Título *</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-md bg-background-surface px-3 py-2.5 text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-lavender">
          Plataforma(s)
        </label>
        <PlatformPicker
          value={form.platform}
          onChange={(platform) => setForm({ ...form, platform })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-lavender">Estado</label>
        <StatusPicker
          value={form.status ?? 'pendiente'}
          onChange={(status: GameStatus) => setForm({ ...form, status })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-lavender">Género</label>
        <input
          value={form.genre ?? ''}
          onChange={(e) => setForm({ ...form, genre: e.target.value })}
          placeholder="Separa varios con coma"
          className="w-full rounded-md bg-background-surface px-3 py-2.5 text-ink ring-1 ring-primary-dark/30 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={saving || !form.title.trim()}
        className="rounded-md bg-primary py-3 font-medium text-white disabled:opacity-40"
      >
        {saving ? 'Guardando...' : 'Guardar juego'}
      </button>
    </form>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLists } from '../hooks/useLists'
import { PageContainer } from '../components/PageContainer'
import { Skeleton } from '../components/Skeleton'

export function Lists() {
  const navigate = useNavigate()
  const { lists, loading, createList, deleteList } = useLists()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    try {
      await createList(name.trim())
      setName('')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string, listName: string) {
    if (!confirm(`¿Eliminar la lista "${listName}"?`)) return
    await deleteList(id)
  }

  return (
    <PageContainer>
      <h1 className="mb-4 text-xl font-semibold">Mis listas</h1>

      <div className="mb-4 flex gap-2 md:max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la lista..."
          className="min-w-0 flex-1 rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-800 focus:outline-none focus:ring-emerald-600"
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex-shrink-0 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Crear
        </button>
      </div>

      {loading && (
        <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!loading && lists.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          Todavía no creaste ninguna lista.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <div
            key={list.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-800"
          >
            <button
              onClick={() => navigate(`/lists/${list.id}`)}
              className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-100"
            >
              {list.name}
            </button>
            <button
              onClick={() => handleDelete(list.id, list.name)}
              className="flex-shrink-0 text-xs text-red-400"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}

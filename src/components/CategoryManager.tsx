import { useState } from 'react'
import { useStore } from '../lib/store'

const PRESETS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#14b8a6']

export function CategoryManager() {
  const { data, dispatch } = useStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESETS[2])

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'category/add', name, color })
    setName('')
  }

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="font-semibold">Категории</h3>

      <ul className="space-y-2">
        {data.categories.map((c) => (
          <li key={c.id} className="flex items-center gap-2">
            <input
              type="color"
              value={c.color}
              onChange={(e) => dispatch({ type: 'category/update', id: c.id, name: c.name, color: e.target.value })}
              className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
              title="Цвет"
            />
            <input
              defaultValue={c.name}
              onBlur={(e) => dispatch({ type: 'category/update', id: c.id, name: e.target.value, color: c.color })}
              className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm hover:border-zinc-700 focus:border-zinc-500 focus:outline-none"
            />
            <button
              onClick={() =>
                confirm(`Удалить категорию «${c.name}»? Её отметки во всех днях тоже пропадут.`) &&
                dispatch({ type: 'category/remove', id: c.id })
              }
              className="rounded-md px-2 text-zinc-500 hover:text-red-400"
              title="Удалить"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="flex items-center gap-2 border-t border-zinc-800 pt-3">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Новая категория"
          className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm outline-none focus:border-zinc-400"
        />
        <button
          disabled={!name.trim()}
          className="rounded-md bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-900 disabled:opacity-40"
        >
          +
        </button>
      </form>
    </div>
  )
}

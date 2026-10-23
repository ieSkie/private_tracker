import { useState } from 'react'
import { useStore } from '../lib/store'
import { useToday } from '../lib/useToday'
import { daysBetween, formatHuman, pluralDays } from '../lib/date'
import type { Habit } from '../lib/types'

export function HabitsPage() {
  const { data, dispatch } = useStore()
  const today = useToday()
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(today)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    dispatch({ type: 'habit/add', name, startDate: startDate > today ? today : startDate })
    setName('')
    setStartDate(today)
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-end"
      >
        <label className="flex-1">
          <span className="mb-1 block text-xs text-zinc-400">Привычка</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Например: без сахара"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-400"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs text-zinc-400">Соблюдаю с</span>
          <input
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => setStartDate(e.target.value || today)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-400"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-900 hover:bg-white disabled:opacity-40"
          disabled={!name.trim()}
        >
          Добавить
        </button>
      </form>

      {data.habits.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">
          Пока пусто. Добавь первую привычку — счётчик пойдёт сам.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.habits.map((h) => (
            <HabitCard key={h.id} habit={h} today={today} />
          ))}
        </div>
      )}
    </div>
  )
}

function HabitCard({ habit, today }: { habit: Habit; today: string }) {
  const { dispatch } = useStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(habit.name)

  const days = Math.max(0, daysBetween(habit.startDate, today))
  const best = Math.max(habit.bestStreak, days)
  const isRecord = days > 0 && days >= habit.bestStreak

  const saveName = () => {
    dispatch({ type: 'habit/rename', id: habit.id, name: draft })
    setEditing(false)
  }

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveName()
              if (e.key === 'Escape') {
                setDraft(habit.name)
                setEditing(false)
              }
            }}
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-left text-lg font-semibold hover:text-white"
            title="Переименовать"
          >
            {habit.name}
          </button>
        )}
        <button
          onClick={() => confirm(`Удалить «${habit.name}»?`) && dispatch({ type: 'habit/remove', id: habit.id })}
          className="rounded-md px-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
          title="Удалить"
        >
          ✕
        </button>
      </div>

      <div className="my-4 flex items-baseline gap-2">
        <span className="text-6xl font-bold tabular-nums">{days}</span>
        <span className="text-zinc-400">{pluralDays(days)}</span>
        {isRecord && days > 1 && (
          <span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
            рекорд
          </span>
        )}
      </div>

      <div className="space-y-1 text-sm text-zinc-400">
        <p>С {formatHuman(habit.startDate)}</p>
        <p>
          Лучшая серия: <span className="text-zinc-200">{best} {pluralDays(best)}</span>
        </p>
      </div>

      <button
        onClick={() =>
          confirm(`Обнулить «${habit.name}»? Текущая серия: ${days} ${pluralDays(days)}.`) &&
          dispatch({ type: 'habit/reset', id: habit.id })
        }
        className="mt-5 rounded-lg border border-red-900/60 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40"
      >
        Обнулить счётчик
      </button>
    </div>
  )
}

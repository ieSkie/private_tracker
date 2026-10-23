import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { formatHuman } from '../lib/date'
import type { DateKey } from '../lib/types'

export function DayPanel({ date }: { date: DateKey }) {
  const { data, dispatch } = useStore()
  const day = data.days[date] ?? { marks: [], note: '' }
  // компонент монтируется заново на каждый день (key={date} в CalendarPage)
  const [note, setNote] = useState(day.note)
  const latest = useRef(note)
  latest.current = note

  // автосохранение заметки с небольшой задержкой
  useEffect(() => {
    if (note === day.note) return
    const t = setTimeout(() => dispatch({ type: 'day/setNote', date, note }), 400)
    return () => clearTimeout(t)
  }, [note]) // eslint-disable-line react-hooks/exhaustive-deps

  // при уходе с дня сохраняем то, что не успело сохраниться
  useEffect(
    () => () => dispatch({ type: 'day/setNote', date, note: latest.current }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="font-semibold capitalize">{formatHuman(date)}</h3>

      <div>
        <p className="mb-2 text-xs text-zinc-400">Отметки</p>
        {data.categories.length === 0 ? (
          <p className="text-sm text-zinc-500">Нет категорий — добавь их ниже.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.categories.map((c) => {
              const active = day.marks.includes(c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => dispatch({ type: 'day/toggleMark', date, categoryId: c.id })}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition"
                  style={{
                    borderColor: c.color,
                    backgroundColor: active ? c.color : 'transparent',
                    color: active ? '#0a0a0a' : c.color,
                  }}
                >
                  {active ? '✓' : '+'} {c.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <label className="block">
        <span className="mb-2 block text-xs text-zinc-400">Заметка о дне</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => dispatch({ type: 'day/setNote', date, note })}
          rows={6}
          placeholder="Что делал, как прошла тренировка, какие слова выучил…"
          className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        />
      </label>
    </div>
  )
}

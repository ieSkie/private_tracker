import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { useToday } from '../lib/useToday'
import { MONTHS, WEEKDAYS, monthGrid, parseKey } from '../lib/date'
import { DayPanel } from '../components/DayPanel'
import { CategoryManager } from '../components/CategoryManager'

export function CalendarPage() {
  const { data } = useStore()
  const today = useToday()
  const t = parseKey(today)
  const [year, setYear] = useState(t.getFullYear())
  const [month, setMonth] = useState(t.getMonth())
  const [selected, setSelected] = useState(today)

  const cells = useMemo(() => monthGrid(year, month), [year, month])
  const catById = useMemo(() => new Map(data.categories.map((c) => [c.id, c])), [data.categories])

  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }
  const goToday = () => {
    setYear(t.getFullYear())
    setMonth(t.getMonth())
    setSelected(today)
  }

  // статистика: за месяц и за год по каждой категории
  const stats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`
    const yearPrefix = `${year}-`
    return data.categories.map((c) => {
      let m = 0
      let y = 0
      for (const [k, d] of Object.entries(data.days)) {
        if (!d.marks.includes(c.id)) continue
        if (k.startsWith(yearPrefix)) y++
        if (k.startsWith(monthPrefix)) m++
      }
      return { ...c, month: m, year: y }
    })
  }, [data.days, data.categories, year, month])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex gap-1">
            <NavBtn onClick={() => shift(-1)}>←</NavBtn>
            <NavBtn onClick={goToday}>Сегодня</NavBtn>
            <NavBtn onClick={() => shift(1)}>→</NavBtn>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((key, i) => {
            if (!key) return <div key={i} />
            const entry = data.days[key]
            const marks = (entry?.marks ?? []).map((id) => catById.get(id)).filter(Boolean)
            const isToday = key === today
            const isSel = key === selected
            const isFuture = key > today
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={[
                  'relative flex aspect-square flex-col rounded-lg border p-1.5 text-left transition sm:p-2',
                  isSel ? 'border-zinc-300 bg-zinc-800' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600',
                  isFuture ? 'opacity-50' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'text-xs sm:text-sm',
                    isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-900' : '',
                  ].join(' ')}
                >
                  {parseKey(key).getDate()}
                </span>

                {entry?.note && (
                  <span className="absolute right-1.5 top-1.5 text-[10px] text-zinc-400" title={entry.note}>
                    ✎
                  </span>
                )}

                <div className="mt-auto flex flex-col gap-0.5">
                  {marks.map((c) => (
                    <span
                      key={c!.id}
                      className="h-1.5 w-full rounded-full sm:h-2"
                      style={{ backgroundColor: c!.color }}
                      title={c!.name}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 font-semibold">Статистика</h3>
          {stats.length === 0 ? (
            <p className="text-sm text-zinc-500">Нет категорий.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.id} className="rounded-xl bg-zinc-950 p-3">
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </div>
                  <div className="text-2xl font-bold tabular-nums">{s.month}</div>
                  <div className="text-xs text-zinc-500">
                    за {MONTHS[month].toLowerCase()} · {s.year} за {year}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <DayPanel key={selected} date={selected} />
        <CategoryManager />
      </aside>
    </div>
  )
}

function NavBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm hover:border-zinc-600"
    >
      {children}
    </button>
  )
}

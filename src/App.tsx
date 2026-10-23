import { useEffect, useRef, useState } from 'react'
import { HabitsPage } from './pages/HabitsPage'
import { CalendarPage } from './pages/CalendarPage'
import { useStore } from './lib/store'
import { exportJson, importJson } from './lib/storage'

type Page = 'habits' | 'calendar'

// роутинг через hash: работает на GitHub Pages и без сервера
const readPage = (): Page => (location.hash === '#/calendar' ? 'calendar' : 'habits')

export default function App() {
  const [page, setPage] = useState<Page>(readPage)

  useEffect(() => {
    const onHash = () => setPage(readPage())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1 rounded-xl bg-zinc-900 p-1">
          <Tab active={page === 'habits'} href="#/">Привычки</Tab>
          <Tab active={page === 'calendar'} href="#/calendar">Календарь</Tab>
        </nav>
        <DataMenu />
      </header>

      {page === 'habits' ? <HabitsPage /> : <CalendarPage />}
    </div>
  )
}

function Tab({ active, href, children }: { active: boolean; href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={[
        'rounded-lg px-4 py-2 text-sm font-medium transition',
        active ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-100',
      ].join(' ')}
    >
      {children}
    </a>
  )
}

function DataMenu() {
  const { data, dispatch } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const imported = await importJson(file)
      if (confirm('Заменить текущие данные данными из файла?')) {
        dispatch({ type: 'data/replace', data: imported })
      }
    } catch (err) {
      alert('Не получилось прочитать файл: ' + (err as Error).message)
    }
  }

  return (
    <div className="flex gap-2 text-sm">
      <button
        onClick={() => exportJson(data)}
        className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:border-zinc-600"
      >
        Экспорт JSON
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:border-zinc-600"
      >
        Импорт
      </button>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
    </div>
  )
}

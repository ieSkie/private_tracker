import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { AppData, DateKey } from './types'
import { loadData, saveData, uid } from './storage'
import { daysBetween, todayKey } from './date'

type Action =
  | { type: 'habit/add'; name: string; startDate: DateKey }
  | { type: 'habit/rename'; id: string; name: string }
  | { type: 'habit/reset'; id: string }
  | { type: 'habit/remove'; id: string }
  | { type: 'category/add'; name: string; color: string }
  | { type: 'category/update'; id: string; name: string; color: string }
  | { type: 'category/remove'; id: string }
  | { type: 'day/toggleMark'; date: DateKey; categoryId: string }
  | { type: 'day/setNote'; date: DateKey; note: string }
  | { type: 'data/replace'; data: AppData }

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'habit/add': {
      const name = action.name.trim()
      if (!name) return state
      return {
        ...state,
        habits: [
          ...state.habits,
          { id: uid(), name, startDate: action.startDate, createdAt: todayKey(), bestStreak: 0 },
        ],
      }
    }
    case 'habit/rename':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id ? { ...h, name: action.name.trim() || h.name } : h,
        ),
      }
    case 'habit/reset': {
      const today = todayKey()
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== action.id) return h
          const current = Math.max(0, daysBetween(h.startDate, today))
          return { ...h, startDate: today, bestStreak: Math.max(h.bestStreak, current) }
        }),
      }
    }
    case 'habit/remove':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) }

    case 'category/add': {
      const name = action.name.trim()
      if (!name) return state
      return {
        ...state,
        categories: [...state.categories, { id: uid(), name, color: action.color }],
      }
    }
    case 'category/update':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, name: action.name.trim() || c.name, color: action.color } : c,
        ),
      }
    case 'category/remove': {
      // убираем и саму категорию, и её отметки во всех днях
      const days: AppData['days'] = {}
      for (const [k, d] of Object.entries(state.days)) {
        const marks = d.marks.filter((m) => m !== action.id)
        if (marks.length || d.note) days[k] = { ...d, marks }
      }
      return { ...state, days, categories: state.categories.filter((c) => c.id !== action.id) }
    }

    case 'day/toggleMark': {
      const day = state.days[action.date] ?? { marks: [], note: '' }
      const marks = day.marks.includes(action.categoryId)
        ? day.marks.filter((m) => m !== action.categoryId)
        : [...day.marks, action.categoryId]
      return setDay(state, action.date, { ...day, marks })
    }
    case 'day/setNote': {
      const day = state.days[action.date] ?? { marks: [], note: '' }
      return setDay(state, action.date, { ...day, note: action.note })
    }

    case 'data/replace':
      return action.data
  }
}

function setDay(state: AppData, date: DateKey, entry: AppData['days'][string]): AppData {
  const days = { ...state.days }
  if (entry.marks.length || entry.note.trim()) days[date] = entry
  else delete days[date] // пустые дни не храним
  return { ...state, days }
}

const Ctx = createContext<{ data: AppData; dispatch: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadData)
  useEffect(() => saveData(data), [data])
  return <Ctx.Provider value={{ data, dispatch }}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

import type { AppData, Category, DayEntry, Habit } from './types'
import { todayKey } from './date'

const STORAGE_KEY = 'habit-tracker:v1'

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

export function defaultData(): AppData {
  return {
    version: 1,
    habits: [],
    categories: [
      { id: uid(), name: 'Зал', color: '#22c55e' },
      { id: uid(), name: 'Английский', color: '#3b82f6' },
    ],
    days: {},
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    return validate(JSON.parse(raw))
  } catch (e) {
    console.error('Не удалось прочитать данные, начинаю с чистого листа', e)
    return defaultData()
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Не удалось сохранить данные', e)
  }
}

export function exportJson(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `habits-backup-${todayKey()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importJson(file: File): Promise<AppData> {
  const text = await file.text()
  return validate(JSON.parse(text))
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const isStr = (v: unknown): v is string => typeof v === 'string'

/** Мягкая валидация: битые записи выкидываем, а не роняем приложение */
function validate(input: unknown): AppData {
  if (!input || typeof input !== 'object') throw new Error('Неверный формат файла')
  const obj = input as Record<string, unknown>

  const habits: Habit[] = Array.isArray(obj.habits)
    ? obj.habits
        .filter((h): h is Habit => !!h && isStr(h.id) && isStr(h.name) && DATE_RE.test(h.startDate))
        .map((h) => ({
          id: h.id,
          name: h.name,
          startDate: h.startDate,
          createdAt: DATE_RE.test(h.createdAt) ? h.createdAt : h.startDate,
          bestStreak: typeof h.bestStreak === 'number' ? h.bestStreak : 0,
        }))
    : []

  const categories: Category[] = Array.isArray(obj.categories)
    ? obj.categories.filter(
        (c): c is Category => !!c && isStr(c.id) && isStr(c.name) && isStr(c.color),
      )
    : defaultData().categories

  const days: Record<string, DayEntry> = {}
  if (obj.days && typeof obj.days === 'object') {
    for (const [key, val] of Object.entries(obj.days as Record<string, unknown>)) {
      if (!DATE_RE.test(key) || !val || typeof val !== 'object') continue
      const v = val as Record<string, unknown>
      const marks = Array.isArray(v.marks) ? v.marks.filter(isStr) : []
      const note = isStr(v.note) ? v.note : ''
      if (marks.length || note) days[key] = { marks, note }
    }
  }

  return { version: 1, habits, categories, days }
}

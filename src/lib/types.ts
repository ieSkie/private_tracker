/** Дата в формате YYYY-MM-DD (локальная) */
export type DateKey = string

export interface Habit {
  id: string
  name: string
  /** День, с которого идёт текущая серия (меняется при обнулении) */
  startDate: DateKey
  createdAt: DateKey
  /** Лучшая серия за всё время, в днях */
  bestStreak: number
}

export interface Category {
  id: string
  name: string
  color: string // hex, например #22c55e
}

export interface DayEntry {
  /** id категорий, отмеченных в этот день */
  marks: string[]
  /** Заметка/описание дня */
  note: string
}

export interface AppData {
  version: 1
  habits: Habit[]
  categories: Category[]
  days: Record<DateKey, DayEntry>
}

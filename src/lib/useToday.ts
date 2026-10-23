import { useEffect, useState } from 'react'
import { todayKey } from './date'

/** Текущая дата, которая сама обновляется после полуночи */
export function useToday() {
  const [today, setToday] = useState(todayKey)
  useEffect(() => {
    const t = setInterval(() => setToday(todayKey()), 60_000)
    const onFocus = () => setToday(todayKey())
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(t)
      window.removeEventListener('focus', onFocus)
    }
  }, [])
  return today
}

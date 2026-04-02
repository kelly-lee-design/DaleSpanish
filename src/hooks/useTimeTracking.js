import { useState, useEffect, useRef, useCallback } from 'react'

const STORAGE_KEY = 'dale_time_tracking'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}시간 ${m}분`
  return `${m}분`
}

function formatTimeShort(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return { value: h, unit: '시간', sub: `${m}분` }
  return { value: m, unit: '분', sub: null }
}

export default function useTimeTracking() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return { daily: {}, totalSeconds: 0 }
  })

  const tickRef = useRef(null)
  const lastTickRef = useRef(Date.now())

  // Tick every 30 seconds to accumulate time
  useEffect(() => {
    lastTickRef.current = Date.now()

    const tick = () => {
      const now = Date.now()
      const elapsed = Math.round((now - lastTickRef.current) / 1000)
      lastTickRef.current = now

      // Only count if tab was active (elapsed < 60s means no long sleep)
      if (elapsed > 0 && elapsed < 120) {
        setData((prev) => {
          const today = getToday()
          const todaySeconds = (prev.daily[today] || 0) + elapsed
          return {
            ...prev,
            daily: { ...prev.daily, [today]: todaySeconds },
            totalSeconds: (prev.totalSeconds || 0) + elapsed,
          }
        })
      }
    }

    tickRef.current = setInterval(tick, 30000)

    // Also track on visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        // Save current time when leaving
        const now = Date.now()
        const elapsed = Math.round((now - lastTickRef.current) / 1000)
        lastTickRef.current = now
        if (elapsed > 0 && elapsed < 120) {
          setData((prev) => {
            const today = getToday()
            return {
              ...prev,
              daily: { ...prev.daily, [today]: (prev.daily[today] || 0) + elapsed },
              totalSeconds: (prev.totalSeconds || 0) + elapsed,
            }
          })
        }
      } else {
        lastTickRef.current = Date.now()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(tickRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const today = getToday()
  const todaySeconds = data.daily[today] || 0
  const totalSeconds = data.totalSeconds || 0

  // Weekly total (last 7 days)
  const weekSeconds = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    return data.daily[key] || 0
  }).reduce((a, b) => a + b, 0)

  // Daily data for chart (last 7 days)
  const weeklyChart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().split('T')[0]
    const dayLabel = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
    return { date: key, seconds: data.daily[key] || 0, day: dayLabel }
  })

  return {
    todaySeconds,
    totalSeconds,
    weekSeconds,
    weeklyChart,
    formatTime,
    formatTimeShort,
    daily: data.daily,
  }
}

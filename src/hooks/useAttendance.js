import { useState, useEffect, useCallback } from 'react'

const getToday = () => new Date().toISOString().split('T')[0]
const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function calcStreaks(days) {
  if (!days.length) return { currentStreak: 0, longestStreak: 0 }

  const today = getToday()
  const sorted = [...days].sort()
  const lastDay = sorted[sorted.length - 1]

  // Current streak: consecutive days ending at lastDay, but only if lastDay is today
  let currentStreak = 0
  if (lastDay === today) {
    currentStreak = 1
    for (let i = sorted.length - 2; i >= 0; i--) {
      const curr = new Date(sorted[i + 1] + 'T00:00:00')
      const prev = new Date(sorted[i] + 'T00:00:00')
      if ((curr - prev) / 86400000 === 1) currentStreak++
      else break
    }
  }

  // Longest streak ever
  let longestStreak = 1
  let temp = 1
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i] + 'T00:00:00')
    const prev = new Date(sorted[i - 1] + 'T00:00:00')
    if ((curr - prev) / 86400000 === 1) {
      temp++
      longestStreak = Math.max(longestStreak, temp)
    } else {
      temp = 1
    }
  }
  longestStreak = Math.max(longestStreak, temp)

  return { currentStreak, longestStreak }
}

export default function useAttendance(storageKey) {
  const DEFAULT = { attendanceDays: [], currentStreak: 0, longestStreak: 0, totalDays: 0 }

  const [streakData, setStreakData] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      const data = saved ? JSON.parse(saved) : DEFAULT

      // Recalculate currentStreak on load (might have broken overnight)
      if (data.attendanceDays.length) {
        const { currentStreak, longestStreak } = calcStreaks(data.attendanceDays)
        return { ...data, currentStreak, longestStreak }
      }
      return data
    } catch {
      return DEFAULT
    }
  })

  // Whether today's check-in just happened this session (for triggering celebration)
  const [justCheckedIn, setJustCheckedIn] = useState(false)

  const checkedInToday = streakData.attendanceDays.includes(getToday())

  // Persist
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(streakData))
  }, [streakData, storageKey])

  // Reload on key change (user switch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      const data = saved ? JSON.parse(saved) : DEFAULT
      if (data.attendanceDays.length) {
        const { currentStreak, longestStreak } = calcStreaks(data.attendanceDays)
        setStreakData({ ...data, currentStreak, longestStreak })
      } else {
        setStreakData(data)
      }
    } catch {
      setStreakData(DEFAULT)
    }
    setJustCheckedIn(false)
  }, [storageKey])

  // The main check-in function — called when user completes an action
  const checkIn = useCallback(() => {
    const today = getToday()

    setStreakData((prev) => {
      if (prev.attendanceDays.includes(today)) return prev // already checked in

      const days = [...prev.attendanceDays, today].sort()
      const { currentStreak, longestStreak } = calcStreaks(days)

      return {
        attendanceDays: days,
        currentStreak,
        longestStreak,
        totalDays: days.length,
      }
    })

    // Only fire celebration if not already checked in
    if (!streakData.attendanceDays.includes(today)) {
      setJustCheckedIn(true)
    }
  }, [streakData.attendanceDays])

  const dismissCelebration = useCallback(() => {
    setJustCheckedIn(false)
  }, [])

  return {
    streakData,
    checkedInToday,
    justCheckedIn,
    checkIn,
    dismissCelebration,
  }
}

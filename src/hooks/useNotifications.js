import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'dale_notifications'

const NOTIFICATION_TEMPLATES = [
  {
    type: 'review',
    title: '¡Hola! 잊으신 문장 없나요?',
    body: '어제 기록한 단어가 기다리고 있어요. 30초만 복습해 볼까요? 🍊',
    icon: '📖',
    action: 'library',
  },
  {
    type: 'streak',
    title: '당도가 올라가고 있어요!',
    body: '벌써 연속 수확 중! 오늘도 출석하고 오렌지를 키워보세요. 🔥',
    icon: '🔥',
    action: 'streak',
  },
  {
    type: 'newContent',
    title: '오늘의 대화 배달',
    body: '현지인 실전 대화문이 도착했어요. 지금 확인해 보세요!',
    icon: '💬',
    action: 'quiz',
  },
]

function generateDailyNotifications() {
  const today = new Date().toISOString().split('T')[0]
  const hour = new Date().getHours()

  const notifications = []

  // Morning: new content
  notifications.push({
    id: `${today}-newContent`,
    ...NOTIFICATION_TEMPLATES[2],
    timestamp: `${today}T09:00:00`,
    read: false,
  })

  // Afternoon: review reminder
  if (hour >= 12) {
    notifications.push({
      id: `${today}-review`,
      ...NOTIFICATION_TEMPLATES[0],
      timestamp: `${today}T14:00:00`,
      read: false,
    })
  }

  // Streak notification (if they've been active)
  notifications.push({
    id: `${today}-streak`,
    ...NOTIFICATION_TEMPLATES[1],
    timestamp: `${today}T08:00:00`,
    read: false,
  })

  return notifications
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Check if we need to add today's notifications
        const today = new Date().toISOString().split('T')[0]
        const hasTodayNotifs = parsed.some((n) => n.id.startsWith(today))
        if (hasTodayNotifs) return parsed
        // Add today's notifications, keep last 7 days
        const weekAgo = Date.now() - 7 * 86400000
        const recent = parsed.filter((n) => new Date(n.timestamp).getTime() > weekAgo)
        return [...generateDailyNotifications(), ...recent]
      }
    } catch {}
    return generateDailyNotifications()
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  }
}

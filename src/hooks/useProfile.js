import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const CHARACTERS = [
  { id: 'happy', label: '기쁨', src: '/assets/apple-happy.png' },
  { id: 'excited', label: '신남', src: '/assets/banana-excited.png' },
  { id: 'cool', label: '멋짐', src: '/assets/pear-cool.png' },
  { id: 'star', label: '스타', src: '/assets/orange-star.png' },
]

export { CHARACTERS }

const DEFAULTS = {
  nickname: '',
  character: 'happy',
  motto: '',
  level: 'A1',
}

export default function useProfile() {
  const { user, isGuest } = useAuth()
  const key = user ? `dale_profile_${user.id}` : 'dale_profile_guest'

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) return { ...DEFAULTS, ...JSON.parse(saved) }
    } catch {}
    // Fallback: use email-derived name if available
    const emailName = user?.email?.split('@')[0] ?? ''
    return { ...DEFAULTS, nickname: emailName }
  })

  const saveProfile = useCallback(
    (updates) => {
      setProfile((prev) => {
        const next = { ...prev, ...updates }
        localStorage.setItem(key, JSON.stringify(next))
        return next
      })
    },
    [key],
  )

  const displayName = profile.nickname || user?.email?.split('@')[0] || '게스트'
  const character = CHARACTERS.find((c) => c.id === profile.character) || CHARACTERS[0]

  return { profile, saveProfile, displayName, character, CHARACTERS }
}

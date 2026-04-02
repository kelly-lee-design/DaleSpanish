import { useState, useCallback } from 'react'

export const DEFAULT_CATEGORIES = [
  { id: 'family', label: '가족', emoji: '👨‍👩‍👧', bgColor: '#FFF1F2' },
  { id: 'shopping', label: '쇼핑', emoji: '🛍️', bgColor: '#F0F9FF' },
  { id: 'time', label: '시간', emoji: '⏰', bgColor: '#F0FDF4' },
  { id: 'food', label: '음식', emoji: '🍽️', bgColor: '#FEFCE8' },
  { id: 'travel', label: '여행', emoji: '✈️', bgColor: '#EEF2FF' },
  { id: 'weather', label: '날씨', emoji: '🌤️', bgColor: '#FFF7ED' },
  { id: 'emotions', label: '감정', emoji: '💭', bgColor: '#FDF4FF' },
  { id: 'daily', label: '일상', emoji: '☀️', bgColor: '#ECFDF5' },
  { id: 'other', label: '기타', emoji: '📝', bgColor: '#F9FAFB' },
]

const STORAGE_KEY = 'dale_custom_categories'

function loadCustomCategories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export default function useCategories() {
  const [customCategories, setCustomCategories] = useState(loadCustomCategories)

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  const addCategory = useCallback((label, emoji) => {
    const id = `custom_${Date.now()}`
    const bgColor = '#F3F4F6'
    const newCat = { id, label, emoji, bgColor, custom: true }
    setCustomCategories((prev) => {
      const updated = [...prev, newCat]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    return id
  }, [])

  const removeCategory = useCallback((id) => {
    setCustomCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { categories: allCategories, customCategories, addCategory, removeCategory }
}

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import SmartInput from './components/SmartInput'
import WordLibrary from './components/WordLibrary'
import QuizMode from './components/QuizMode'
import EssentialVerbs from './components/EssentialVerbs'
import StreakView from './components/StreakView'
import CheckInCelebration from './components/CheckInCelebration'
import LoginPage from './components/LoginPage'
import SplashScreen from './components/SplashScreen'
import { AuthProvider, useAuth } from './context/AuthContext'
import useAttendance from './hooks/useAttendance'
import useCategories from './hooks/useCategories'
import useProfile from './hooks/useProfile'
import useNotifications from './hooks/useNotifications'
import useTimeTracking from './hooks/useTimeTracking'
import ProfileSettings from './components/ProfileSettings'
import TopHeader from './components/TopHeader'
import NotificationCenter from './components/NotificationCenter'

const STORAGE_KEY = 'dale_words'
const MISSION_KEY = 'dale_mission'
const STREAK_KEY = 'dale_streak'

const getToday = () => new Date().toISOString().split('T')[0]

const SAMPLE_WORDS = [
  {
    id: 'sample-1',
    word: 'hablar',
    meaning: '말하다',
    category: 'daily',
    aiSentences: [
      { es: 'Me gusta hablar con mis amigos en el café.', ko: '카페에서 친구들이랑 얘기하는 게 좋아.' },
      { es: '¿Puedes hablar más despacio, por favor?', ko: '좀 더 천천히 말해줄 수 있어요?' },
    ],
    reviewCount: 3,
    knownCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sample-2',
    word: 'familia',
    meaning: '가족',
    category: 'family',
    aiSentences: [
      { es: 'Mi familia es muy importante para mí.', ko: '가족은 나한테 정말 소중해.' },
      { es: 'Este fin de semana voy a visitar a mi familia.', ko: '이번 주말에 가족 보러 갈 거야.' },
    ],
    reviewCount: 5,
    knownCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-3',
    word: 'comer',
    meaning: '먹다',
    category: 'food',
    aiSentences: [
      { es: '¿Quieres comer conmigo esta tarde?', ko: '오늘 오후에 나랑 같이 밥 먹을래?' },
      { es: 'Me encanta comer tapas con mis amigos.', ko: '친구들이랑 타파스 먹는 거 너무 좋아.' },
    ],
    reviewCount: 4,
    knownCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'sample-4',
    word: 'tiempo',
    meaning: '시간, 날씨',
    category: 'weather',
    aiSentences: [
      { es: 'No tengo tiempo para ir al gimnasio hoy.', ko: '오늘 헬스장 갈 시간이 없어.' },
      { es: 'El tiempo en Madrid es muy soleado en verano.', ko: '마드리드는 여름에 날씨가 정말 맑아.' },
    ],
    reviewCount: 2,
    knownCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'sample-5',
    word: 'gracias',
    meaning: '감사합니다',
    category: 'daily',
    aiSentences: [
      { es: '¡Muchas gracias por tu ayuda!', ko: '도와줘서 정말 고마워!' },
      { es: 'Gracias por venir a mi fiesta.', ko: '파티에 와줘서 고마워.' },
    ],
    reviewCount: 6,
    knownCount: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sample-6',
    word: 'comprar',
    meaning: '사다, 구매하다',
    category: 'shopping',
    aiSentences: [
      { es: 'Voy a comprar frutas en el mercado.', ko: '시장에서 과일 사러 갈 거야.' },
      { es: '¿Dónde puedo comprar una tarjeta de metro?', ko: '지하철 카드는 어디서 살 수 있어요?' },
    ],
    reviewCount: 1,
    knownCount: 0,
    createdAt: new Date().toISOString(),
  },
]

const DEFAULT_MISSION = () => ({
  date: getToday(),
  wordsAdded: 0,
  sentencesRead: false,
  wordQuizCompleted: false,
  sentenceQuizCompleted: false,
})

function AppInner() {
  const { isAuthenticated, loading, user } = useAuth()
  const [view, setView] = useState('dashboard')

  // Scope localStorage per user so different accounts don't share data
  const storageKey = user ? `dale_words_${user.id}` : STORAGE_KEY
  const missionKey = user ? `dale_mission_${user.id}` : MISSION_KEY
  const streakKey = user ? `dale_streak_${user.id}` : STREAK_KEY

  const [words, setWords] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) return JSON.parse(saved)
      return SAMPLE_WORDS
    } catch {
      return SAMPLE_WORDS
    }
  })

  const [mission, setMission] = useState(() => {
    try {
      const saved = localStorage.getItem(missionKey)
      const parsed = saved ? JSON.parse(saved) : null
      if (parsed?.date === getToday()) return parsed
      return DEFAULT_MISSION()
    } catch {
      return DEFAULT_MISSION()
    }
  })

  // Action-based attendance (not auto on load)
  const { streakData, checkedInToday, justCheckedIn, checkIn, dismissCelebration } =
    useAttendance(streakKey)
  const { categories, addCategory, removeCategory } = useCategories()
  const { profile, saveProfile, displayName, character } = useProfile()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const timeTracking = useTimeTracking()
  const [showNotifications, setShowNotifications] = useState(false)

  // Reload words when user changes (login/logout)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    setWords(saved ? JSON.parse(saved) : SAMPLE_WORDS)
    const savedMission = localStorage.getItem(missionKey)
    const parsed = savedMission ? JSON.parse(savedMission) : null
    setMission(parsed?.date === getToday() ? parsed : DEFAULT_MISSION())
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(words))
  }, [words, storageKey])

  useEffect(() => {
    localStorage.setItem(missionKey, JSON.stringify(mission))
  }, [mission, missionKey])

  const addWord = (newWord) => {
    const word = {
      id: crypto.randomUUID(),
      ...newWord,
      reviewCount: 0,
      knownCount: 0,
      createdAt: new Date().toISOString(),
    }
    setWords((prev) => [word, ...prev])
    setMission((prev) => ({ ...prev, wordsAdded: prev.wordsAdded + 1 }))
  }

  const updateWord = (id, updates) => {
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)))
  }

  const deleteWord = (id) => {
    setWords((prev) => prev.filter((w) => w.id !== id))
  }

  const completeMission = (key) => {
    setMission((prev) => ({ ...prev, [key]: true }))
    checkIn() // Action-based attendance: completing any mission counts as check-in
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl font-black text-[#FF5722]">¡DALE!</div>
          <div className="w-8 h-8 border-3 border-[#FF5722] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <LoginPage />

  const props = { words, mission, addWord, updateWord, deleteWord, completeMission, setView, streakData, checkIn, checkedInToday, categories, addCategory, removeCategory, displayName, character, profile }

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <Navbar view={view} setView={setView} variant="sidebar" />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopHeader
          setView={setView}
          character={character}
          unreadCount={unreadCount}
          onBellClick={() => setShowNotifications((v) => !v)}
          currentStreak={streakData.currentStreak}
        />
        <main className="flex-1 pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {view === 'dashboard' && <Dashboard {...props} />}
              {view === 'input' && <SmartInput {...props} />}
              {view === 'library' && <WordLibrary {...props} />}
              {view === 'quiz' && <QuizMode {...props} />}
              {view === 'verbs' && <EssentialVerbs {...props} />}
              {view === 'streak' && <StreakView {...props} streakData={streakData} timeTracking={timeTracking} />}
              {view === 'profile' && <ProfileSettings profile={profile} saveProfile={saveProfile} displayName={displayName} character={character} setView={setView} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Navbar view={view} setView={setView} variant="bottom" />
      <AnimatePresence>
        {showNotifications && (
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
            removeNotification={removeNotification}
            onClose={() => setShowNotifications(false)}
            onNavigate={(v) => setView(v)}
            character={character}
          />
        )}
      </AnimatePresence>
      {justCheckedIn && (
        <CheckInCelebration
          streak={streakData.currentStreak}
          onDismiss={dismissCelebration}
        />
      )}
    </div>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <SplashScreen />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AppInner />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthProvider>
  )
}

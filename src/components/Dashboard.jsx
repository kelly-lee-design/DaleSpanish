import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DonutChart from './DonutChart'
import { CheckCircle2, Circle, ChevronRight, BookOpen, Zap, Trophy, Flame, MessageCircle, Sparkles } from 'lucide-react'
import { ESSENTIAL_VERBS } from '../data/essentialVerbs'

import { DEFAULT_CATEGORIES } from '../hooks/useCategories'

const DAILY_WORD_GOAL = 5

export default function Dashboard({ words, mission, setView, completeMission, streakData, checkIn, checkedInToday, categories = DEFAULT_CATEGORIES, displayName, character, profile }) {
  const todayWords = words.filter((w) => {
    const created = new Date(w.createdAt)
    return created.toDateString() === new Date().toDateString()
  })

  const totalReviews = words.reduce((sum, w) => sum + w.reviewCount, 0)
  const totalKnown = words.reduce((sum, w) => sum + w.knownCount, 0)
  const quizRate = totalReviews > 0 ? Math.round((totalKnown / totalReviews) * 100) : 0

  const categoryCounts = words.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] || 0) + 1
    return acc
  }, {})

  const missionItems = [
    {
      key: 'wordsAdded',
      label: `단어 ${DAILY_WORD_GOAL}개 등록 (${Math.min(mission.wordsAdded, DAILY_WORD_GOAL)}/${DAILY_WORD_GOAL})`,
      done: mission.wordsAdded >= DAILY_WORD_GOAL,
      action: () => setView('input'),
    },
    {
      key: 'sentencesRead',
      label: '예문 읽기 완료',
      done: mission.sentencesRead,
      action: () => setView('library'),
    },
    {
      key: 'wordQuizCompleted',
      label: '단어 퀴즈 완료',
      done: mission.wordQuizCompleted,
      action: () => setView('quiz'),
    },
    {
      key: 'sentenceQuizCompleted',
      label: '예문 퀴즈 완료',
      done: mission.sentenceQuizCompleted,
      action: () => setView('quiz'),
    },
  ]

  const missionDoneCount = missionItems.filter((m) => m.done).length
  const MISSION_TOTAL = missionItems.length

  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{today}</p>
          <h1 className="text-2xl font-black text-gray-900 mt-1">
            ¡Hola!{' '}
            <span className="text-[#FF5722]">{displayName || '게스트'}님</span>{' '}
            <span>🔥</span>
          </h1>
          {profile?.motto && (
            <p className="text-xs text-gray-400 mt-0.5">"{profile.motto}"</p>
          )}
        </div>
        <button
          onClick={() => setView('profile')}
          className="hidden md:flex w-12 h-12 rounded-2xl bg-[#FF5722]/10 hover:bg-[#FF5722]/20 transition-colors flex-shrink-0 overflow-hidden items-center justify-center"
        >
          {character ? (
            <img src={character.src} alt="profile" className="w-[180%] h-[180%] object-cover" />
          ) : (
            <div className="w-full h-full rounded-xl bg-[#FF5722] flex items-center justify-center text-white font-black text-lg">
              {(displayName || '?')[0].toUpperCase()}
            </div>
          )}
        </button>
      </div>

      {/* 오늘의 문장 확인 — triggers attendance check-in */}
      <DailySentenceCard words={words} checkIn={checkIn} checkedInToday={checkedInToday} />

      {/* Streak card */}
      <StreakCard streakData={streakData} setView={setView} checkedInToday={checkedInToday} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: words.length, label: '전체 단어', icon: '📚' },
          { value: todayWords.length, label: '오늘 추가', icon: '✨' },
          { value: `${quizRate}%`, label: '정답률', icon: '🎯' },
        ].map(({ value, label, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-lg mb-0.5">{icon}</div>
            <div className="text-2xl font-black text-[#FF5722]">{value}</div>
            <div className="text-xs text-gray-400 mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Achievement chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Trophy size={17} className="text-[#FF5722]" />
          오늘의 달성률
          <span className="ml-auto text-xs text-gray-400 font-normal">{missionDoneCount}/{MISSION_TOTAL} 완료</span>
        </h2>
        <div className="flex items-center gap-6">
          <DonutChart value={missionDoneCount} max={MISSION_TOTAL} size={110} strokeWidth={10} />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5722] flex-shrink-0" />
              <span className="text-gray-500">미션 달성</span>
              <span className="font-bold ml-auto text-gray-900">{missionDoneCount}개</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-200 flex-shrink-0" />
              <span className="text-gray-500">남은 미션</span>
              <span className="font-bold ml-auto text-gray-900">{MISSION_TOTAL - missionDoneCount}개</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-100 flex-shrink-0" />
              <span className="text-gray-500">오늘 단어</span>
              <span className="font-bold ml-auto text-gray-900">
                {todayWords.length}/{DAILY_WORD_GOAL}
              </span>
            </div>
          </div>
        </div>

        {/* Word goal bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>오늘 단어 목표</span>
            <span>{todayWords.length}/{DAILY_WORD_GOAL}개</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-[#FF5722] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((todayWords.length / DAILY_WORD_GOAL) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily missions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Zap size={17} className="text-[#FF5722]" />
          오늘의 미션
        </h2>
        <div className="space-y-2.5">
          {missionItems.map((item) => (
            <button
              key={item.key}
              onClick={item.action}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left ${
                item.done
                  ? 'bg-[#4CAF50]/10'
                  : 'bg-gray-50 hover:bg-gray-100 active:scale-[0.99]'
              }`}
            >
              {item.done ? (
                <CheckCircle2 size={20} className="text-[#4CAF50] flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-gray-300 flex-shrink-0" />
              )}
              <span
                className={`text-sm flex-1 font-medium ${
                  item.done ? 'text-gray-400 line-through' : 'text-gray-700'
                }`}
              >
                {item.label}
              </span>
              {!item.done && <ChevronRight size={16} className="text-gray-300" />}
            </button>
          ))}
        </div>
      </div>

      {/* 필수 동사 100 */}
      <EssentialVerbsCard words={words} setView={setView} />

      {/* Category grid */}
      <div>
        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
          <BookOpen size={17} className="text-[#FF5722]" />
          카테고리별 단어
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {categories.map(({ id, label, emoji, bgColor }) => {
            const count = categoryCounts[id] || 0
            return (
              <button
                key={id}
                onClick={() => setView('library')}
                style={{ backgroundColor: bgColor }}
                className="rounded-2xl p-3.5 text-center hover:opacity-80 active:scale-95 transition-all"
              >
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="text-xs font-bold text-gray-700">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{count}개</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Streak banner */}
      {missionDoneCount === MISSION_TOTAL && (
        <div className="bg-gradient-to-r from-[#FF5722] to-[#FF8A65] rounded-2xl p-5 text-white text-center">
          <div className="text-3xl mb-1">🎉</div>
          <p className="font-black text-lg">오늘 모든 미션 완료!</p>
          <p className="text-orange-100 text-sm mt-0.5">¡Excelente trabajo! 내일도 파이팅!</p>
        </div>
      )}

      {/* Social link */}
      <div className="flex justify-center pt-2 pb-4">
        <a
          href="https://open.kakao.com/o/gbyqomoi"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FEE500] text-[#3C1E1E] text-sm font-bold hover:brightness-95 active:scale-95 transition-all shadow-sm"
        >
          <MessageCircle size={16} />
          카카오톡 오픈채팅 참여하기
        </a>
      </div>
    </div>
  )
}

// ── Daily Sentence Card — action-based check-in ──
function DailySentenceCard({ words, checkIn, checkedInToday }) {
  const [revealed, setRevealed] = useState(false)

  // Pick a random sentence from user's words (deterministic per day)
  const allSentences = words.flatMap((w) =>
    (w.aiSentences || [])
      .filter((s) => s.es && s.ko)
      .map((s) => ({ word: w.word, meaning: w.meaning, es: s.es, ko: s.ko }))
  )

  // Use day-of-year as seed for consistent daily pick
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  )
  const sentence = allSentences.length
    ? allSentences[dayOfYear % allSentences.length]
    : null

  const handleReveal = () => {
    setRevealed(true)
    checkIn()
  }

  if (!sentence) return null

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={17} className="text-[#FF5722]" />
        <h2 className="font-bold text-gray-900 text-sm">오늘의 문장</h2>
        {checkedInToday && (
          <span className="ml-auto text-[10px] font-bold text-[#FF5722] bg-orange-50 px-2 py-0.5 rounded-full">
            출석 완료 ✓
          </span>
        )}
      </div>

      <p className="text-base font-bold text-gray-900 leading-relaxed">{sentence.es}</p>
      <p className="text-xs text-gray-400 mt-1">
        {sentence.word} — {sentence.meaning}
      </p>

      <AnimatePresence mode="wait">
        {!revealed && !checkedInToday ? (
          <motion.button
            key="btn"
            onClick={handleReveal}
            className="mt-3 w-full py-3 bg-[#FF5722] text-white font-bold text-sm rounded-xl shadow-sm hover:bg-[#E64A19] active:scale-[0.98] transition-all"
            whileTap={{ scale: 0.98 }}
          >
            해석 확인하고 출석하기 🔥
          </motion.button>
        ) : (
          <motion.div
            key="answer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-3 bg-orange-50 rounded-xl p-3.5"
          >
            <p className="text-sm font-medium text-gray-700">{sentence.ko}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Streak Card ──
function StreakCard({ streakData, setView, checkedInToday }) {
  const { currentStreak, totalDays, attendanceDays } = streakData || { currentStreak: 0, totalDays: 0, attendanceDays: [] }
  const today = new Date().toISOString().split('T')[0]

  // Recent 7 days
  const recent7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <button
      onClick={() => setView('streak')}
      className="w-full bg-gradient-to-r from-[#FF5722] to-[#FF8A65] rounded-2xl shadow-sm px-5 py-4 text-left text-white hover:shadow-md active:scale-[0.99] transition-all relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-yellow-300" />
          <span className="font-bold text-sm">연속 출석</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black">{currentStreak}</span>
          <span className="text-xs text-orange-100 font-medium">일</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 relative z-10">
        {recent7.map((dateStr) => {
          const attended = attendanceDays.includes(dateStr)
          const isToday = dateStr === today
          const d = new Date(dateStr + 'T00:00:00')
          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-orange-200 font-medium">
                {dayLabels[d.getDay()]}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  attended
                    ? 'bg-white text-[#FF5722]'
                    : isToday
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-orange-200'
                }`}
              >
                {attended ? '✓' : d.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/20 relative z-10">
        <span className="text-[11px] text-orange-100">총 {totalDays}일 출석</span>
        <ChevronRight size={14} className="text-orange-200" />
      </div>
    </button>
  )
}

function EssentialVerbsCard({ words, setView }) {
  const learnedVerbs = ESSENTIAL_VERBS.filter(v =>
    words.some(w => w.word.toLowerCase() === v.verb)
  )
  const learnedCount = learnedVerbs.length
  const unlearnedPreviews = ESSENTIAL_VERBS.filter(v =>
    !words.some(w => w.word.toLowerCase() === v.verb)
  ).slice(0, 6)

  return (
    <button
      onClick={() => setView('verbs')}
      className="w-full bg-white rounded-2xl shadow-sm px-5 py-4 hover:bg-gray-50 active:scale-[0.99] transition-all text-left"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-base">💪</span>
        <span className="font-bold text-gray-900 text-sm flex-1">필수 동사 100</span>
        <span className="text-xs font-bold text-[#FF5722]">{learnedCount}/100</span>
        <ChevronRight size={14} className="text-gray-300" />
      </div>
      <div className="bg-gray-100 rounded-full h-1 mb-3 overflow-hidden">
        <div
          className="bg-[#FF5722] h-1 rounded-full transition-all duration-500"
          style={{ width: `${learnedCount}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {unlearnedPreviews.map(v => (
          <span
            key={v.verb}
            className="bg-orange-50 text-[#FF5722] text-xs font-bold px-2.5 py-1 rounded-full"
          >
            {v.verb}
          </span>
        ))}
        {100 - learnedCount - unlearnedPreviews.length > 0 && (
          <span className="bg-gray-100 text-gray-400 text-xs font-bold px-2.5 py-1 rounded-full">
            +{100 - learnedCount - unlearnedPreviews.length}
          </span>
        )}
      </div>
    </button>
  )
}

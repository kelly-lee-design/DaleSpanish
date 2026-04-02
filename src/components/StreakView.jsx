import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Share2, Flame, Calendar, Trophy, Star, Download, X, Clock, Timer } from 'lucide-react'

// ── helpers ──
const getToday = () => new Date().toISOString().split('T')[0]

const formatDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

const getDayLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00')
  return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
}

const getMonthWeeks = (year, month) => {
  const weeks = []
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  let current = new Date(first)
  current.setDate(current.getDate() - current.getDay()) // start from Sunday

  while (current <= last || weeks.length < 1) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current).toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    if (current > last && current.getDay() === 0) break
  }
  return weeks
}

const STREAK_MESSAGES = [
  { min: 0, msg: '오늘부터 시작해볼까요?', emoji: '🌱' },
  { min: 1, msg: '좋은 시작이에요!', emoji: '🔥' },
  { min: 3, msg: '습관이 만들어지고 있어요!', emoji: '💪' },
  { min: 7, msg: '일주일 연속! 대단해요!', emoji: '⭐' },
  { min: 14, msg: '2주 연속! 멋져요!', emoji: '🏆' },
  { min: 30, msg: '한 달 연속! 전설이에요!', emoji: '👑' },
]

function getStreakMessage(streak) {
  let result = STREAK_MESSAGES[0]
  for (const s of STREAK_MESSAGES) {
    if (streak >= s.min) result = s
  }
  return result
}

// ── Share Modal (Instagram Story 9:16 format) ──
function ShareModal({ streak, totalDays, wordCount, quizRate, todaySentence, userName, attendanceDays, onClose }) {
  const canvasRef = useRef(null)
  const [sharing, setSharing] = useState(false)
  const today = getToday()

  const generateStoryImage = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    // Instagram Story: 1080x1920
    const w = 1080
    const h = 1920
    canvas.width = w
    canvas.height = h

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, '#FFF8F5')
    grad.addColorStop(0.5, '#FFEDE8')
    grad.addColorStop(1, '#FFF8F5')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Top accent bar
    const barGrad = ctx.createLinearGradient(0, 0, w, 0)
    barGrad.addColorStop(0, '#FF5722')
    barGrad.addColorStop(1, '#FF8A65')
    ctx.fillStyle = barGrad
    ctx.fillRect(0, 0, w, 12)

    // Character image
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = '/assets/orange-splash-2.png'
      })
      ctx.drawImage(img, (w - 400) / 2, 100, 400, 400)
    } catch {
      ctx.fillStyle = '#FF572222'
      ctx.beginPath()
      ctx.arc(w / 2, 300, 150, 0, Math.PI * 2)
      ctx.fill()
    }

    // Title
    ctx.textAlign = 'center'
    ctx.fillStyle = '#FF5722'
    ctx.font = 'bold 72px sans-serif'
    ctx.fillText('¡DALE!', w / 2, 580)

    // User name
    ctx.fillStyle = '#6B7280'
    ctx.font = '32px sans-serif'
    ctx.fillText(`${userName}님의 스페인어 학습 기록`, w / 2, 640)

    // Streak big number
    ctx.fillStyle = '#FF5722'
    ctx.font = 'bold 180px sans-serif'
    ctx.fillText(`${streak}`, w / 2, 830)
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText('일 연속 출석 🔥', w / 2, 900)

    // Divider
    ctx.fillStyle = '#FFE0D6'
    ctx.beginPath()
    ctx.roundRect(120, 950, w - 240, 4, 2)
    ctx.fill()

    // Today's sentence
    if (todaySentence) {
      ctx.fillStyle = '#1F2937'
      ctx.font = 'bold 36px sans-serif'
      ctx.fillText('오늘 복습한 문장', w / 2, 1030)

      // Sentence card background
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(80, 1060, w - 160, 160, 24)
      ctx.fill()
      ctx.fillStyle = '#FF5722'
      ctx.font = 'bold 32px sans-serif'
      ctx.fillText(todaySentence.es.length > 40 ? todaySentence.es.slice(0, 40) + '...' : todaySentence.es, w / 2, 1120)
      ctx.fillStyle = '#6B7280'
      ctx.font = '28px sans-serif'
      ctx.fillText(todaySentence.ko.length > 40 ? todaySentence.ko.slice(0, 40) + '...' : todaySentence.ko, w / 2, 1175)
    }

    // Stats row
    const statsY = todaySentence ? 1320 : 1100
    const stats = [
      { label: '총 출석일', value: `${totalDays}일`, icon: '📅' },
      { label: '학습 단어', value: `${wordCount}개`, icon: '📚' },
      { label: '정답률', value: `${quizRate}%`, icon: '🎯' },
    ]
    const statW = (w - 160) / 3
    stats.forEach((s, i) => {
      const x = 80 + i * statW + statW / 2
      // Card bg
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.roundRect(80 + i * statW + 10, statsY - 20, statW - 20, 140, 20)
      ctx.fill()
      ctx.textAlign = 'center'
      ctx.font = '48px sans-serif'
      ctx.fillText(s.icon, x, statsY + 30)
      ctx.fillStyle = '#1F2937'
      ctx.font = 'bold 40px sans-serif'
      ctx.fillText(s.value, x, statsY + 80)
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '24px sans-serif'
      ctx.fillText(s.label, x, statsY + 112)
    })

    // Recent 7 days
    const dotsY = statsY + 200
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('최근 7일', w / 2, dotsY)

    const dotSpacing = 120
    const dotStartX = (w - 6 * dotSpacing) / 2
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const x = dotStartX + i * dotSpacing
      const attended = attendanceDays.includes(dateStr)

      ctx.beginPath()
      ctx.arc(x, dotsY + 60, 28, 0, Math.PI * 2)
      ctx.fillStyle = attended ? '#FF5722' : '#F3F4F6'
      ctx.fill()

      if (attended) {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 24px sans-serif'
        ctx.fillText('✓', x, dotsY + 68)
      }

      ctx.fillStyle = '#9CA3AF'
      ctx.font = '20px sans-serif'
      ctx.fillText(getDayLabel(dateStr), x, dotsY + 110)
    }

    // Footer
    ctx.textAlign = 'center'
    ctx.fillStyle = '#D1D5DB'
    ctx.font = '22px sans-serif'
    ctx.fillText(today, w / 2, h - 60)
    ctx.fillStyle = '#FF5722'
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('¡DALE! — 스페인어 학습 앱', w / 2, h - 100)

    return canvas.toDataURL('image/png')
  }, [streak, totalDays, wordCount, quizRate, todaySentence, userName, attendanceDays, today])

  const handleShare = async () => {
    setSharing(true)
    try {
      const dataUrl = await generateStoryImage()
      if (!dataUrl) return

      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], 'dale-streak.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '¡DALE! 출석 기록',
            text: `${userName}님은 ${streak}일 연속 출석 중! 🔥`,
            files: [file],
          })
          setSharing(false)
          return
        }
      }

      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'dale-streak-story.png'
      a.click()
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err)
    } finally {
      setSharing(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preview header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-700">출석 카드 미리보기</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Preview card */}
          <div className="p-5">
            <div className="bg-gradient-to-br from-[#FFF8F5] to-[#FFEDE8] rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF5722]/5 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/assets/orange-character.png"
                  alt=""
                  className="w-12 h-12 object-contain"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div>
                  <p className="text-xs text-gray-400">¡DALE!</p>
                  <p className="text-sm font-bold text-gray-700">{userName}님의 학습 기록</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <span className="text-5xl font-black text-[#FF5722]">{streak}</span>
                <span className="text-lg font-bold text-gray-500 ml-1">일 연속 🔥</span>
              </div>

              {todaySentence && (
                <div className="bg-white/80 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-400 mb-1">오늘 복습한 문장</p>
                  <p className="text-sm font-bold text-gray-800">{todaySentence.es}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{todaySentence.ko}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { v: `${totalDays}일`, l: '총 출석' },
                  { v: `${wordCount}개`, l: '학습 단어' },
                  { v: `${quizRate}%`, l: '정답률' },
                ].map(({ v, l }) => (
                  <div key={l} className="bg-white/60 rounded-lg py-2">
                    <div className="text-sm font-black text-gray-800">{v}</div>
                    <div className="text-[10px] text-gray-400">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 space-y-2">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="w-full py-3 bg-[#FF5722] text-white font-bold text-sm rounded-xl hover:bg-[#E64A19] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Share2 size={16} />
              {sharing ? '생성 중...' : '이미지 저장 / 공유'}
            </button>
          </div>
        </motion.div>
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main Component ──
export default function StreakView({ setView, streakData, words, timeTracking }) {
  const today = getToday()
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [showShareModal, setShowShareModal] = useState(false)

  const { currentStreak, longestStreak, totalDays, attendanceDays } = streakData

  const totalReviews = words.reduce((sum, w) => sum + w.reviewCount, 0)
  const totalKnown = words.reduce((sum, w) => sum + w.knownCount, 0)
  const quizRate = totalReviews > 0 ? Math.round((totalKnown / totalReviews) * 100) : 0

  // Today's sentence for share card
  const allSentences = words.flatMap((w) =>
    (w.aiSentences || []).filter((s) => s.es && s.ko).map((s) => ({ es: s.es, ko: s.ko }))
  )
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const todaySentence = allSentences.length ? allSentences[dayOfYear % allSentences.length] : null

  const weeks = getMonthWeeks(viewMonth.year, viewMonth.month)
  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  })

  const prevMonth = () => {
    setViewMonth((prev) => {
      const d = new Date(prev.year, prev.month - 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const nextMonth = () => {
    setViewMonth((prev) => {
      const d = new Date(prev.year, prev.month + 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  const streakMsg = getStreakMessage(currentStreak)

  // Recent 7 days for preview strip
  const recent7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('dashboard')}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-black text-gray-900">출석 기록</h1>
      </div>

      {/* Streak hero card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-[#FF5722] to-[#FF8A65] rounded-3xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <Flame size={28} className="text-yellow-300" />
            </motion.div>
            <span className="text-sm font-bold text-orange-100">연속 출석</span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <motion.span
              key={currentStreak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="text-6xl font-black"
            >
              {currentStreak}
            </motion.span>
            <span className="text-xl font-bold text-orange-100">일</span>
          </div>

          <p className="text-orange-100 text-sm font-medium">
            {streakMsg.emoji} {streakMsg.msg}
          </p>

          {/* Mini stats */}
          <div className="flex gap-4 mt-5 pt-4 border-t border-white/20">
            <div>
              <div className="text-2xl font-black">{totalDays}</div>
              <div className="text-xs text-orange-100">총 출석일</div>
            </div>
            <div>
              <div className="text-2xl font-black">{longestStreak}</div>
              <div className="text-xs text-orange-100">최장 연속</div>
            </div>
            <div>
              <div className="text-2xl font-black">{words.length}</div>
              <div className="text-xs text-orange-100">학습 단어</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Share button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5722] text-white font-bold text-sm rounded-full shadow-lg hover:bg-[#E64A19] active:scale-95 transition-all"
        >
          <Share2 size={16} />
          출석 카드 공유
        </button>
      </div>

      {showShareModal && (
        <ShareModal
          streak={currentStreak}
          totalDays={totalDays}
          wordCount={words.length}
          quizRate={quizRate}
          todaySentence={todaySentence}
          userName="학습자"
          attendanceDays={attendanceDays}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Learning time card */}
      {timeTracking && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Clock size={14} className="text-[#FF5722]" />
            학습 시간
          </h3>

          {/* Time stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: '오늘', seconds: timeTracking.todaySeconds, color: '#FF5722' },
              { label: '이번 주', seconds: timeTracking.weekSeconds, color: '#F59E0B' },
              { label: '전체', seconds: timeTracking.totalSeconds, color: '#8B5CF6' },
            ].map(({ label, seconds, color }) => {
              const { value, unit, sub } = timeTracking.formatTimeShort(seconds)
              return (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-2xl font-black" style={{ color }}>{value}</span>
                    <span className="text-xs font-bold text-gray-400">{unit}</span>
                  </div>
                  {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
                  <div className="text-[10px] text-gray-400 mt-1 font-medium">{label}</div>
                </div>
              )
            })}
          </div>

          {/* Weekly bar chart */}
          <div className="flex items-end gap-2 h-24">
            {timeTracking.weeklyChart.map(({ date, seconds, day }) => {
              const maxSeconds = Math.max(...timeTracking.weeklyChart.map(d => d.seconds), 60)
              const height = seconds > 0 ? Math.max((seconds / maxSeconds) * 100, 8) : 4
              const isToday = date === new Date().toISOString().split('T')[0]
              const minutes = Math.floor(seconds / 60)
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400 font-medium">
                    {minutes > 0 ? `${minutes}분` : ''}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className={`w-full rounded-t-lg ${
                      isToday
                        ? 'bg-gradient-to-t from-[#FF5722] to-[#FF8A65]'
                        : seconds > 0
                          ? 'bg-[#FF5722]/20'
                          : 'bg-gray-100'
                    }`}
                  />
                  <span className={`text-[10px] font-medium ${isToday ? 'text-[#FF5722] font-bold' : 'text-gray-400'}`}>
                    {day}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Weekly strip */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl p-4 shadow-sm"
      >
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Star size={14} className="text-[#FF5722]" />
          이번 주 출석
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {recent7.map((dateStr) => {
            const attended = attendanceDays.includes(dateStr)
            const isToday = dateStr === today
            return (
              <div key={dateStr} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-medium">
                  {getDayLabel(dateStr)}
                </span>
                <motion.div
                  initial={isToday ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    attended
                      ? 'bg-[#FF5722] text-white shadow-sm shadow-orange-200'
                      : isToday
                        ? 'bg-orange-50 text-[#FF5722] ring-2 ring-[#FF5722]/30'
                        : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  {attended ? '✓' : new Date(dateStr + 'T00:00:00').getDate()}
                </motion.div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Monthly calendar */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            ‹
          </button>
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Calendar size={14} className="text-[#FF5722]" />
            {monthLabel}
          </h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <div key={d} className="text-center text-[10px] text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((dateStr) => {
                const d = new Date(dateStr + 'T00:00:00')
                const inMonth = d.getMonth() === viewMonth.month
                const attended = attendanceDays.includes(dateStr)
                const isToday = dateStr === today
                const isFuture = dateStr > today

                return (
                  <div
                    key={dateStr}
                    className={`aspect-square flex items-center justify-center rounded-xl text-xs font-medium transition-all ${
                      !inMonth
                        ? 'text-gray-200'
                        : attended
                          ? 'bg-[#FF5722] text-white font-bold shadow-sm shadow-orange-100'
                          : isToday
                            ? 'bg-orange-50 text-[#FF5722] font-bold ring-1 ring-[#FF5722]/20'
                            : isFuture
                              ? 'text-gray-200'
                              : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {attended && inMonth ? (
                      <span className="text-[10px]">🔥</span>
                    ) : (
                      d.getDate()
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Monthly summary */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            이번 달 출석:{' '}
            <span className="font-bold text-[#FF5722]">
              {attendanceDays.filter((d) => {
                const dt = new Date(d + 'T00:00:00')
                return dt.getFullYear() === viewMonth.year && dt.getMonth() === viewMonth.month
              }).length}
            </span>
            일
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-[#FF5722]" />
              <span className="text-gray-400">출석</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <span className="text-gray-400">미출석</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5 shadow-sm"
      >
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-[#FF5722]" />
          출석 뱃지
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { days: 3, label: '3일 연속', emoji: '🌱', color: '#4CAF50' },
            { days: 7, label: '7일 연속', emoji: '🔥', color: '#F59E0B' },
            { days: 14, label: '14일 연속', emoji: '⭐', color: '#FF5722' },
            { days: 30, label: '30일 연속', emoji: '🏆', color: '#8B5CF6' },
            { days: 60, label: '60일 연속', emoji: '💎', color: '#3B82F6' },
            { days: 100, label: '100일 연속', emoji: '👑', color: '#EF4444' },
          ].map(({ days, label, emoji, color }) => {
            const earned = longestStreak >= days
            return (
              <div
                key={days}
                className={`rounded-xl p-3 text-center transition-all ${
                  earned ? 'bg-white shadow-md border border-gray-100' : 'bg-gray-50 opacity-40'
                }`}
              >
                <div className={`text-2xl mb-1 ${earned ? '' : 'grayscale'}`}>{emoji}</div>
                <div className="text-[10px] font-bold text-gray-600">{label}</div>
                {earned && (
                  <div className="text-[9px] mt-0.5 font-medium" style={{ color }}>
                    달성!
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

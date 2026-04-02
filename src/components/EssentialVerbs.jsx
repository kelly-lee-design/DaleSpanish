import { useState, useRef, useCallback } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, List, LayoutGrid, RotateCcw } from 'lucide-react'
import SpeakButton from './SpeakButton'
import { ESSENTIAL_VERBS } from '../data/essentialVerbs'

const TENSES = [
  { key: 'presente', label: '현재', color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'preterito', label: '과거', color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'futuro', label: '미래', color: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/10' },
]

export default function EssentialVerbs({ words, setView }) {
  const [mode, setMode] = useState('list') // 'list' | 'flashcard'

  const learnedCount = ESSENTIAL_VERBS.filter(v =>
    words.some(w => w.word.toLowerCase() === v.verb)
  ).length

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="pt-2">
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-3"
        >
          <ChevronLeft size={16} />
          대시보드
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">💪 필수 동사 100</h1>
          <span className="text-sm font-bold text-[#FF5722]">{learnedCount}/100</span>
        </div>
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-[#FF5722] h-2 rounded-full transition-all duration-500"
              style={{ width: `${learnedCount}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1">
        <button
          onClick={() => setMode('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            mode === 'list' ? 'bg-[#FF5722] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <List size={15} />
          목록
        </button>
        <button
          onClick={() => setMode('flashcard')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            mode === 'flashcard' ? 'bg-[#FF5722] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <LayoutGrid size={15} />
          플래시카드
        </button>
      </div>

      {mode === 'list'
        ? <ListView words={words} setView={setView} />
        : <FlashcardView words={words} setView={setView} />
      }
    </div>
  )
}

function ListView({ words, setView }) {
  const [expandedVerb, setExpandedVerb] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? ESSENTIAL_VERBS : ESSENTIAL_VERBS.slice(0, 20)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {visible.map((v, i) => {
        const learned = words.some(w => w.word.toLowerCase() === v.verb)
        const isOpen = expandedVerb === v.verb
        return (
          <div key={v.verb} className={i !== visible.length - 1 ? 'border-b border-gray-50' : ''}>
            <div
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${learned ? 'bg-orange-50/40' : ''}`}
              onClick={() => setExpandedVerb(isOpen ? null : v.verb)}
            >
              <span className="text-xs text-gray-300 w-5 flex-shrink-0 text-right">{i + 1}</span>
              {learned ? (
                <CheckCircle2 size={15} className="text-[#FF5722] flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
              )}
              <span className={`text-sm font-bold flex-1 ${learned ? 'text-[#FF5722]' : 'text-gray-900'}`}>
                {v.verb}
              </span>
              <span className="text-xs text-gray-400 flex-1">{v.meaning}</span>
              <div className="flex items-center gap-1">
                <SpeakButton text={v.verb} />
                {!learned && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setView('input') }}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-[#FF5722] hover:bg-orange-50 transition-colors"
                    title="단어 추가"
                  >
                    <Plus size={13} />
                  </button>
                )}
                {isOpen ? <ChevronUp size={14} className="text-gray-300" /> : <ChevronDown size={14} className="text-gray-300" />}
              </div>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 space-y-2 bg-gray-50/50">
                {TENSES.map(({ key, label, color, bg }) => {
                  const ex = v[key]
                  if (!ex?.es) return null
                  return (
                    <div key={key} className={`${bg} rounded-xl p-3`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${color}`}>{label}</span>
                        <SpeakButton text={ex.es} />
                      </div>
                      <p className="text-sm font-medium text-gray-800">{ex.es}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ex.ko}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
      <button
        onClick={() => setShowAll(s => !s)}
        className="w-full py-3 text-xs font-bold text-gray-400 hover:text-[#FF5722] hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
      >
        {showAll ? <><ChevronUp size={14} /> 접기</> : <><ChevronDown size={14} /> 전체 100개 보기</>}
      </button>
    </div>
  )
}

function FlashcardView({ words, setView }) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false })

  const v = ESSENTIAL_VERBS[index]
  const learned = words.some(w => w.word.toLowerCase() === v.verb)
  const progress = ((index + 1) / ESSENTIAL_VERBS.length) * 100

  const goNext = useCallback(() => {
    if (index < ESSENTIAL_VERBS.length - 1) {
      setIndex(i => i + 1)
      setIsFlipped(false)
    }
  }, [index])

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex(i => i - 1)
      setIsFlipped(false)
    }
  }, [index])

  const handleRestart = () => {
    setIndex(0)
    setIsFlipped(false)
  }

  const handleFlip = () => {
    if (touchRef.current.swiping) return
    setIsFlipped(f => !f)
  }

  const onTouchStart = (e) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, swiping: false }
  }

  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchRef.current.startX
    const dy = e.touches[0].clientY - touchRef.current.startY
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      touchRef.current.swiping = true
      setSwipeOffset(dx * 0.4)
    }
  }

  const onTouchEnd = () => {
    if (touchRef.current.swiping) {
      if (swipeOffset < -50) goNext()
      else if (swipeOffset > 50) goPrev()
    }
    setSwipeOffset(0)
    setTimeout(() => { touchRef.current.swiping = false }, 50)
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span className="font-bold">{index + 1} / {ESSENTIAL_VERBS.length}</span>
        <button onClick={handleRestart} className="flex items-center gap-1 hover:text-[#FF5722] transition-colors text-xs font-bold">
          <RotateCcw size={13} />
          처음부터
        </button>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-[#FF5722] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="cursor-pointer select-none"
        style={{ perspective: '1200px', height: '320px' }}
        onClick={handleFlip}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: swipeOffset ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d',
            transform: `translateX(${swipeOffset}px) ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}`,
          }}
        >
          {/* Front */}
          <div
            style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 text-center"
          >
            {learned && (
              <div className="flex items-center gap-1 text-xs text-[#FF5722] font-bold mb-4">
                <CheckCircle2 size={13} />
                학습 완료
              </div>
            )}
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Español</span>
            <h2 className="text-4xl font-black text-gray-900">{v.verb}</h2>
            <div className="mt-5">
              <SpeakButton text={v.verb} size="lg" />
            </div>
            <div className="mt-4 text-xs text-gray-300 bg-gray-50 px-4 py-2 rounded-full">
              탭하여 뜻 확인 · 스와이프하여 이동 👆
            </div>
          </div>

          {/* Back */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="bg-[#FFF5EE] rounded-2xl shadow-sm flex flex-col items-center justify-center p-6 text-center overflow-auto border border-orange-100"
          >
            <span className="text-xs font-bold text-[#FF5722]/60 uppercase tracking-widest mb-2">한국어</span>
            <h2 className="text-2xl font-black text-gray-900 mb-4">{v.meaning}</h2>
            <div className="w-full space-y-2">
              {TENSES.map(({ key, label }) => {
                const ex = v[key]
                if (!ex?.es) return null
                return (
                  <div key={key} className="bg-white rounded-xl p-2.5 text-left shadow-sm">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-[#FF5722]">{label}</span>
                      <SpeakButton text={ex.es} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 leading-relaxed">{ex.es}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{ex.ko}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <ChevronLeft size={18} />
          이전
        </button>
        <button
          onClick={goNext}
          disabled={index === ESSENTIAL_VERBS.length - 1}
          className="py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-[#FF5722] text-white hover:bg-[#E64A19] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          다음
          <ChevronRight size={18} />
        </button>
      </div>

      {!learned && (
        <button
          onClick={() => setView('input')}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-400 hover:border-[#FF5722] hover:text-[#FF5722] transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={15} />
          내 단어장에 추가
        </button>
      )}
    </div>
  )
}

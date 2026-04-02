import { useState, useRef, useCallback } from 'react'
import { Search, Trash2, MessageCircle, BookMarked, ChevronLeft, ChevronRight, List, LayoutGrid, RotateCcw } from 'lucide-react'
import { normalizeSentence } from '../lib/openai'
import SpeakButton from './SpeakButton'

import { DEFAULT_CATEGORIES } from '../hooks/useCategories'

export default function WordLibrary({ words, deleteWord, completeMission, categories = DEFAULT_CATEGORIES }) {
  const CATEGORIES = [{ id: 'all', label: '전체', emoji: '📚' }, ...categories]
  const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]))
  const CAT_EMOJI = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.emoji]))
  const [mode, setMode] = useState('list')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = words.filter((w) => {
    const matchSearch =
      !search ||
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.meaning.includes(search)
    const matchCat = activeCategory === 'all' || w.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-black text-gray-900">
          단어장 <span className="text-[#FF5722]">📚</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">{words.length}개의 단어가 저장되어 있어요</p>
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

      {/* Search + category filter — only in list mode */}
      {mode === 'list' && (
        <>
          <div className="relative">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="단어 또는 뜻으로 검색..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50 focus:border-[#FF5722] transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                  activeCategory === id
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
          {(search || activeCategory !== 'all') && (
            <p className="text-xs text-gray-400">{filtered.length}개 표시 중</p>
          )}
        </>
      )}

      {mode === 'list'
        ? <ListView filtered={filtered} search={search} activeCategory={activeCategory} deleteWord={deleteWord} completeMission={completeMission} CAT_LABEL={CAT_LABEL} CAT_EMOJI={CAT_EMOJI} />
        : <FlashcardView words={words} completeMission={completeMission} />
      }
    </div>
  )
}

/* ─── List View ─────────────────────────────────────────── */
function ListView({ filtered, search, activeCategory, deleteWord, completeMission, CAT_LABEL, CAT_EMOJI }) {
  const [expandedId, setExpandedId] = useState(null)
  const [expanded, setExpanded] = useState(new Set())

  const handleExpand = (id) => {
    if (!expanded.has(id)) {
      setExpanded(new Set(expanded).add(id))
      completeMission('sentencesRead')
    }
    setExpandedId(expandedId === id ? null : id)
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-gray-500 text-sm font-medium">
          {search || activeCategory !== 'all' ? '검색 결과가 없어요' : '아직 저장된 단어가 없어요'}
        </p>
        {!search && activeCategory === 'all' && (
          <p className="text-xs text-gray-400 mt-1">단어 추가 탭에서 첫 번째 단어를 등록해보세요!</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filtered.map((word) => {
        const isOpen = expandedId === word.id
        const hasSentences = word.aiSentences?.length > 0
        const accuracy = word.reviewCount > 0 ? Math.round((word.knownCount / word.reviewCount) * 100) : null

        return (
          <div key={word.id} className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all">
            <div className="p-4">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{word.word}</h3>
                    <SpeakButton text={word.word} />
                    <span className="text-xs bg-orange-50 text-[#FF5722] px-2 py-0.5 rounded-full font-bold">
                      {CAT_EMOJI[word.category]} {CAT_LABEL[word.category] || '기타'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-0.5">{word.meaning}</p>
                  <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                    <span className="text-xs text-gray-400">복습 {word.reviewCount}회</span>
                    {accuracy !== null && (
                      <span className={`text-xs font-bold ${accuracy >= 70 ? 'text-[#4CAF50]' : accuracy >= 40 ? 'text-yellow-500' : 'text-red-400'}`}>
                        정답률 {accuracy}%
                      </span>
                    )}
                    {hasSentences && (
                      <span className="text-xs text-[#FF5722] font-medium">예문 {word.aiSentences.length}개</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {hasSentences && (
                    <button
                      onClick={() => handleExpand(word.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-[#FF5722] hover:bg-orange-50 transition-colors"
                    >
                      <MessageCircle size={17} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteWord(word.id)}
                    className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            </div>

            {isOpen && hasSentences && (
              <div className="border-t border-gray-50 px-4 pb-4 pt-3 bg-gradient-to-b from-orange-50/50 to-orange-50 space-y-2.5">
                <p className="text-xs font-bold text-[#FF5722] flex items-center gap-1">
                  <BookMarked size={12} />
                  AI 예문
                </p>
                {word.aiSentences.map((sentence, i) => {
                  const { es, ko } = normalizeSentence(sentence)
                  return (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs font-bold text-[#FF5722] mt-0.5 flex-shrink-0">{i + 1}.</span>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-start gap-1.5">
                          <p className="text-sm font-medium text-gray-800 leading-relaxed flex-1">{es}</p>
                          <SpeakButton text={es} />
                        </div>
                        {ko && <p className="text-xs text-gray-400 leading-relaxed">{ko}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Flashcard View ────────────────────────────────────── */
function FlashcardView({ words, completeMission }) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false })

  const goNext = useCallback(() => { setIndex(i => Math.min(i + 1, words.length - 1)); setIsFlipped(false) }, [words.length])
  const goPrev = useCallback(() => { setIndex(i => Math.max(i - 1, 0)); setIsFlipped(false) }, [])

  if (words.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-gray-500 text-sm font-medium">아직 저장된 단어가 없어요</p>
      </div>
    )
  }

  const word = words[index]
  const hasSentences = word.aiSentences?.length > 0

  const handleRestart = () => { setIndex(0); setIsFlipped(false) }

  const handleFlip = () => {
    if (touchRef.current.swiping) return
    if (!isFlipped) completeMission('sentencesRead')
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
        <span className="font-bold">{index + 1} / {words.length}</span>
        <button onClick={handleRestart} className="flex items-center gap-1 hover:text-[#FF5722] transition-colors text-xs font-bold">
          <RotateCcw size={13} />
          처음부터
        </button>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-[#FF5722] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / words.length) * 100}%` }}
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
            position: 'relative', width: '100%', height: '100%',
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
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">Español</span>
            <h2 className="text-4xl font-black text-gray-900">{word.word}</h2>
            <div className="mt-5"><SpeakButton text={word.word} size="lg" /></div>
            <div className="mt-4 text-xs text-gray-300 bg-gray-50 px-4 py-2 rounded-full">탭하여 뜻 확인 · 스와이프하여 이동 👆</div>
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
            <h2 className="text-2xl font-black text-gray-900 mb-3">{word.meaning}</h2>
            {hasSentences && (
              <div className="w-full space-y-2">
                {word.aiSentences.slice(0, 2).map((s, i) => {
                  const { es, ko } = normalizeSentence(s)
                  return (
                    <div key={i} className="bg-white rounded-xl p-2.5 text-left shadow-sm">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-[#FF5722]">예문 {i + 1}</span>
                        <SpeakButton text={es} />
                      </div>
                      <p className="text-sm font-bold text-gray-900 leading-relaxed">{es}</p>
                      {ko && <p className="text-xs font-medium text-gray-500 mt-0.5">{ko}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
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
          disabled={index === words.length - 1}
          className="py-4 rounded-2xl font-bold flex items-center justify-center gap-2 bg-[#FF5722] text-white hover:bg-[#E64A19] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          다음
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

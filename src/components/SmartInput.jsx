import { useState, useEffect, useRef, useMemo } from 'react'
import { Sparkles, Plus, CheckCircle, AlertCircle, Loader2, Info, Wand2, X } from 'lucide-react'
import { generateSentences, normalizeSentence } from '../lib/openai'
import SpeakButton from './SpeakButton'

const CATEGORY_KEYWORDS = {
  family: ['가족', '엄마', '아빠', '부모', '형', '누나', '오빠', '언니', '동생', '아들', '딸', '할머니', '할아버지', '남편', '아내', '결혼', '아이', '아기', '삼촌', '이모', '조카', '사촌', '친척'],
  food: ['먹다', '음식', '요리', '맛', '밥', '빵', '고기', '과일', '채소', '마시다', '커피', '차', '물', '식당', '맥주', '와인', '아침', '점심', '저녁', '디저트', '케이크', '설탕', '소금', '배고프'],
  travel: ['여행', '비행기', '공항', '호텔', '관광', '지도', '여권', '가방', '나라', '도시', '해변', '산', '기차', '버스', '택시', '표', '예약'],
  weather: ['날씨', '비', '눈', '바람', '맑다', '흐리다', '춥다', '덥다', '따뜻', '시원', '태양', '구름', '온도', '습도', '계절', '봄', '여름', '가을', '겨울'],
  shopping: ['사다', '구매', '쇼핑', '가격', '돈', '비싸다', '싸다', '카드', '현금', '가게', '시장', '옷', '신발', '모자', '할인', '세일', '지갑', '계산'],
  time: ['시간', '분', '초', '오전', '오후', '어제', '오늘', '내일', '주', '월', '년', '항상', '가끔', '자주', '일찍', '늦다', '시계', '달력'],
  emotions: ['감정', '기쁘다', '슬프다', '행복', '화나다', '걱정', '두렵다', '사랑', '좋아하다', '싫어하다', '외롭다', '즐겁다', '놀라다', '부끄럽다', '자랑', '그리워', '울다', '웃다', '기분'],
  daily: ['일상', '아침', '잠', '자다', '일어나다', '씻다', '학교', '일하다', '공부', '운동', '산책', '청소', '빨래', '전화', '집', '문', '창문', '방'],
}

function detectCategory(meaning, word) {
  if (!meaning) return ''
  const text = (meaning + ' ' + word).toLowerCase()
  let bestMatch = ''
  let bestScore = 0
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => text.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = catId
    }
  }
  return bestScore > 0 ? bestMatch : ''
}

async function fetchMeaning(word) {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=es|ko`
  )
  const data = await res.json()
  const translated = data?.responseData?.translatedText
  // MyMemory sometimes returns the original word if it can't translate
  if (!translated || translated.toLowerCase() === word.toLowerCase()) return null
  return translated
}

export default function SmartInput({ addWord, words = [], categories = [], addCategory, removeCategory }) {
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [category, setCategory] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('')
  const [loading, setLoading] = useState(false)
  const [meaningLoading, setMeaningLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)
  const debounceRef = useRef(null)
  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY

  // Auto-fetch meaning when word changes (debounced 700ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = word.trim()
    if (!trimmed || trimmed.length < 2) {
      setAutoFilled(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setMeaningLoading(true)
      try {
        const result = await fetchMeaning(trimmed)
        if (result) {
          setMeaning(result)
          setAutoFilled(true)
          const detected = detectCategory(result, trimmed)
          if (detected) setCategory(detected)
        }
      } catch {
        // silently fail — user can type manually
      } finally {
        setMeaningLoading(false)
      }
    }, 700)

    return () => clearTimeout(debounceRef.current)
  }, [word])

  const handleMeaningChange = (e) => {
    const val = e.target.value
    setMeaning(val)
    setAutoFilled(false)
    const detected = detectCategory(val, word)
    if (detected) setCategory(detected)
  }

  const handleGenerate = async () => {
    if (!word.trim() || !meaning.trim()) {
      setError('단어와 뜻을 모두 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    setPreview(null)
    try {
      const sentences = await generateSentences(word.trim(), meaning.trim())
      setPreview(sentences)
    } catch (e) {
      setError('예문 생성 중 오류가 발생했습니다: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const isDuplicate = word.trim() && words.some((w) => w.word.toLowerCase() === word.trim().toLowerCase())

  const handleSave = () => {
    if (!word.trim() || !meaning.trim()) return
    if (isDuplicate) {
      setError('이미 등록된 단어입니다.')
      return
    }
    addWord({
      word: word.trim(),
      meaning: meaning.trim(),
      category: category || 'other',
      aiSentences: preview || [],
    })
    setWord('')
    setMeaning('')
    setCategory('')
    setPreview(null)
    setError('')
    setAutoFilled(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && word.trim() && meaning.trim()) {
      handleGenerate()
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-black text-gray-900">
          단어 추가 <span className="text-[#FF5722]">✨</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">단어를 입력하면 뜻이 자동으로 채워져요</p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        {/* Spanish word */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1.5">
            스페인어 단어
          </label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: hablar, familia, comer..."
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
              isDuplicate
                ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400'
                : 'border-gray-200 focus:ring-[#FF5722]/50 focus:border-[#FF5722]'
            } text-gray-900 placeholder-gray-300`}
          />
          {isDuplicate && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <AlertCircle size={12} />
              이미 등록된 단어입니다
            </p>
          )}
        </div>

        {/* Meaning — with auto-fill indicator */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-bold text-gray-700">뜻 (한국어)</label>
            {autoFilled && (
              <span className="text-xs text-[#FF5722] flex items-center gap-1 font-medium">
                <Wand2 size={11} />
                자동 입력됨
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={meaning}
              onChange={handleMeaningChange}
              onKeyDown={handleKeyDown}
              placeholder="단어 입력 시 자동으로 채워져요..."
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50 focus:border-[#FF5722] text-gray-900 placeholder-gray-300 transition-all pr-10 ${
                autoFilled
                  ? 'border-orange-200 bg-orange-50/50'
                  : 'border-gray-200'
              }`}
            />
            {meaningLoading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-[#FF5722]" />
              </div>
            )}
          </div>
        </div>

        {/* Category (optional) */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">
            카테고리 <span className="text-xs font-normal text-gray-400">(선택)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ id, label, emoji, custom }) => (
              <button
                key={id}
                onClick={() => setCategory(category === id ? '' : id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all relative group ${
                  category === id
                    ? 'bg-[#FF5722] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{emoji}</span>
                {label}
                {custom && removeCategory && (
                  <span
                    onClick={(e) => { e.stopPropagation(); removeCategory(id) }}
                    className="hidden group-hover:flex absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full items-center justify-center"
                  >
                    <X size={10} />
                  </span>
                )}
              </button>
            ))}
            {/* Add category button */}
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border-2 border-dashed border-gray-300 text-gray-400 hover:border-[#FF5722] hover:text-[#FF5722] transition-all"
            >
              <Plus size={14} />
              추가
            </button>
          </div>

          {/* Add category modal */}
          {showAddCategory && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600">이모지 선택</label>
                <div className="flex flex-wrap gap-1.5">
                  {['📖','🎵','💼','🏠','🎮','⚽','🐶','🌸','💊','🎨','📱','✏️','🚗','💰','🎓','🏋️','💡','🍀','🎯','🔔','🌍','🎁','📸','🧳'].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewCatEmoji(e)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        newCatEmoji === e
                          ? 'bg-[#FF5722] scale-110 shadow-sm'
                          : 'bg-white border border-gray-200 hover:border-[#FF5722]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <input
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                placeholder="카테고리 이름"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50 focus:border-[#FF5722]"
                maxLength={10}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (newCatLabel.trim()) {
                      const id = addCategory(newCatLabel.trim(), newCatEmoji || '🏷️')
                      setCategory(id)
                      setNewCatLabel('')
                      setNewCatEmoji('')
                      setShowAddCategory(false)
                    }
                  }}
                  disabled={!newCatLabel.trim()}
                  className="flex-1 py-2 rounded-lg bg-[#FF5722] text-white text-xs font-bold disabled:opacity-40 transition-all"
                >
                  {newCatEmoji || '🏷️'} {newCatLabel.trim() || '카테고리'} 추가하기
                </button>
                <button
                  onClick={() => { setShowAddCategory(false); setNewCatLabel(''); setNewCatEmoji('') }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 text-xs font-bold"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* AI Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !word.trim() || !meaning.trim()}
          className="w-full py-3 rounded-xl bg-orange-50 text-[#FF5722] font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              AI 예문 생성 중...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              AI 예문 생성하기
            </>
          )}
        </button>
      </div>

      {/* AI Preview */}
      {preview && (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={16} className="text-[#FF5722]" />
            AI 생성 예문
          </h3>
          {preview.map((sentence, i) => {
            const { es, ko } = normalizeSentence(sentence)
            return (
              <div key={i} className="bg-orange-50 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[#FF5722] font-black mt-0.5 flex-shrink-0">{i + 1}</span>
                  <p className="text-sm font-semibold text-gray-900 leading-relaxed flex-1">{es}</p>
                  <SpeakButton text={es} />
                </div>
                {ko && (
                  <p className="text-xs text-gray-500 leading-relaxed pl-4">{ko}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!word.trim() || !meaning.trim()}
        className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
          success
            ? 'bg-[#4CAF50] text-white'
            : 'bg-[#FF5722] text-white hover:bg-[#E64A19] active:scale-[0.99]'
        }`}
      >
        {success ? (
          <>
            <CheckCircle size={20} />
            저장 완료!
          </>
        ) : (
          <>
            <Plus size={20} />
            단어 저장하기
          </>
        )}
      </button>

      {!hasApiKey && (
        <div className="flex items-start gap-2 text-xs text-gray-400 bg-white rounded-2xl p-4 shadow-sm">
          <Info size={14} className="flex-shrink-0 mt-0.5 text-[#FF5722]" />
          <span>
            AI 예문 생성을 위해{' '}
            <code className="bg-gray-100 px-1 rounded font-mono">.env</code> 파일에{' '}
            <code className="bg-gray-100 px-1 rounded font-mono">VITE_OPENAI_API_KEY</code>를
            설정하세요. API 키 없이도 단어 저장은 가능합니다.
          </span>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { RotateCcw, Check, X, List, FileText } from 'lucide-react'
import { normalizeSentence } from '../lib/openai'
import SpeakButton from './SpeakButton'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizMode({ words, updateWord, completeMission }) {
  const [tab, setTab] = useState('word')

  if (words.length < 4) {
    return (
      <div className="max-w-lg mx-auto p-6 flex flex-col items-center justify-center min-h-[70vh] text-center gap-4">
        <div className="text-6xl">📚</div>
        <div>
          <h2 className="text-xl font-black text-gray-900">단어가 부족해요!</h2>
          <p className="text-gray-400 text-sm mt-1">퀴즈를 위해 최소 4개의 단어를 등록해주세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-black text-gray-900">퀴즈 <span className="text-[#FF5722]">🧠</span></h1>
      </div>

      {/* Tab toggle */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm flex gap-1">
        <button
          onClick={() => setTab('word')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'word' ? 'bg-[#FF5722] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <List size={15} />
          단어 퀴즈
        </button>
        <button
          onClick={() => setTab('sentence')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === 'sentence' ? 'bg-[#FF5722] text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <FileText size={15} />
          예문 퀴즈
        </button>
      </div>

      {tab === 'word'
        ? <WordQuiz key="word" words={words} updateWord={updateWord} completeMission={completeMission} />
        : <SentenceQuiz key="sentence" words={words} updateWord={updateWord} completeMission={completeMission} />
      }
    </div>
  )
}

/* ─── Word Quiz ─────────────────────────────────────────── */
function buildWordQuestion(deck, index) {
  const correct = deck[index]
  const distractors = shuffle(deck.filter((_, i) => i !== index)).slice(0, 3)
  return { correct, choices: shuffle([correct, ...distractors]) }
}

function WordQuiz({ words, updateWord, completeMission }) {
  const [deck] = useState(() => shuffle(words))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState({ known: 0, unknown: 0 })
  const [wrongAnswers, setWrongAnswers] = useState([])
  const [done, setDone] = useState(false)

  const { correct, choices } = useMemo(() => buildWordQuestion(deck, currentIndex), [deck, currentIndex])

  const answered = selected !== null
  const isCorrect = answered && selected.id === correct.id

  const handleSelect = (choice) => {
    if (answered) return
    setSelected(choice)
    const known = choice.id === correct.id
    updateWord(correct.id, {
      reviewCount: correct.reviewCount + 1,
      knownCount: known ? correct.knownCount + 1 : correct.knownCount,
    })
    setResults(r => ({ known: r.known + (known ? 1 : 0), unknown: r.unknown + (known ? 0 : 1) }))
    if (!known) {
      setWrongAnswers(prev => [...prev, { word: correct.word, meaning: correct.meaning, selected: choice.meaning }])
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 >= deck.length) {
      setDone(true)
      completeMission('wordQuizCompleted')
    } else {
      setCurrentIndex(i => i + 1)
      setSelected(null)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelected(null)
    setResults({ known: 0, unknown: 0 })
    setWrongAnswers([])
    setDone(false)
  }

  if (done) return <QuizResult results={results} total={deck.length} onRestart={handleRestart} wrongAnswers={wrongAnswers} />

  const choiceStyle = (choice) => {
    if (!answered) return 'bg-white border-2 border-gray-100 hover:border-[#FF5722] hover:bg-orange-50 active:scale-[0.98]'
    if (choice.id === correct.id) return 'bg-[#4CAF50]/10 border-2 border-[#4CAF50]'
    if (choice.id === selected.id) return 'bg-red-50 border-2 border-red-300'
    return 'bg-white border-2 border-gray-100 opacity-50'
  }

  return (
    <>
      <QuizProgress current={currentIndex} total={deck.length} results={results} />

      {/* Question */}
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">뜻을 고르세요</span>
        <h2 className="text-4xl font-black text-gray-900 mt-4 mb-5">{correct.word}</h2>
        <SpeakButton text={correct.word} size="lg" />
        {correct.category && <p className="text-xs text-gray-300 mt-4 font-medium">#{correct.category}</p>}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-1 gap-2.5">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleSelect(choice)}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all ${choiceStyle(choice)}`}
          >
            <span className="text-sm font-bold text-gray-800 flex-1">{choice.meaning}</span>
            {answered && choice.id === correct.id && <Check size={18} className="text-[#4CAF50] flex-shrink-0" />}
            {answered && choice.id === selected.id && choice.id !== correct.id && <X size={18} className="text-red-400 flex-shrink-0" />}
          </button>
        ))}
      </div>

      <QuizFeedback isCorrect={isCorrect} answered={answered} correctLabel={correct.meaning} onNext={handleNext} isLast={currentIndex + 1 >= deck.length} />
    </>
  )
}

/* ─── Sentence Quiz ─────────────────────────────────────── */
function getValidSentences(word) {
  return (word.aiSentences || [])
    .map(s => normalizeSentence(s))
    .filter(s => s.es && s.ko)
}

function buildSentenceQuestion(deck, index) {
  if (!deck.length) return null
  const correct = deck[index]
  if (!correct) return null
  const validSentences = getValidSentences(correct)
  if (!validSentences.length) return null

  const { es, ko: correctKo } = validSentences[Math.floor(Math.random() * validSentences.length)]

  const distractorKos = shuffle(
    deck
      .filter((_, i) => i !== index)
      .flatMap(w => getValidSentences(w).map(s => s.ko))
  ).slice(0, 3)

  const choices = shuffle([correctKo, ...distractorKos])
  return { correctWordId: correct.id, es, correctKo, choices }
}

function SentenceQuiz({ words, updateWord, completeMission }) {
  const wordsWithSentences = useMemo(
    () => words.filter(w => getValidSentences(w).length > 0),
    [words]
  )
  const hasEnough = wordsWithSentences.length >= 4
  const [deck] = useState(() => shuffle(hasEnough ? wordsWithSentences : []))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState({ known: 0, unknown: 0 })
  const [wrongAnswers, setWrongAnswers] = useState([])
  const [done, setDone] = useState(false)

  const question = useMemo(
    () => hasEnough ? buildSentenceQuestion(deck, currentIndex) : null,
    [deck, currentIndex, hasEnough]
  )
  const correct = question ? deck.find(w => w.id === question.correctWordId) : null
  const { es, correctKo, choices } = question || {}
  const correctWordId = question?.correctWordId

  const answered = selected !== null
  const isCorrect = answered && selected === correctKo

  const handleSelect = (ko) => {
    if (answered) return
    setSelected(ko)
    const known = ko === correctKo
    updateWord(correct.id, {
      reviewCount: correct.reviewCount + 1,
      knownCount: known ? correct.knownCount + 1 : correct.knownCount,
    })
    setResults(r => ({ known: r.known + (known ? 1 : 0), unknown: r.unknown + (known ? 0 : 1) }))
    if (!known) {
      setWrongAnswers(prev => [...prev, { word: es, meaning: correctKo, selected: ko }])
    }
  }

  const handleNext = () => {
    if (currentIndex + 1 >= deck.length) {
      setDone(true)
      completeMission('sentenceQuizCompleted')
    } else {
      setCurrentIndex(i => i + 1)
      setSelected(null)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelected(null)
    setResults({ known: 0, unknown: 0 })
    setWrongAnswers([])
    setDone(false)
  }

  if (done) return <QuizResult results={results} total={deck.length} onRestart={handleRestart} wrongAnswers={wrongAnswers} />

  if (!hasEnough || !question) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm space-y-2">
        <div className="text-4xl">📝</div>
        <p className="font-black text-gray-900">예문이 부족해요</p>
        <p className="text-sm text-gray-400">한국어 번역이 포함된 AI 예문이 4개 이상 필요해요.<br/>단어 추가 시 AI 예문 생성 버튼을 눌러주세요.</p>
      </div>
    )
  }

  const choiceStyle = (ko) => {
    if (!answered) return 'bg-white border-2 border-gray-100 hover:border-[#FF5722] hover:bg-orange-50 active:scale-[0.98]'
    if (ko === correctKo) return 'bg-[#4CAF50]/10 border-2 border-[#4CAF50]'
    if (ko === selected) return 'bg-red-50 border-2 border-red-300'
    return 'bg-white border-2 border-gray-100 opacity-50'
  }

  return (
    <>
      <QuizProgress current={currentIndex} total={deck.length} results={results} />

      {/* Question — Spanish sentence */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">올바른 한국어 해석을 고르세요</span>
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-bold text-gray-900 leading-relaxed flex-1">{es}</p>
            <SpeakButton text={es} />
          </div>
        </div>
      </div>

      {/* Choices — Korean translations */}
      <div className="grid grid-cols-1 gap-2.5">
        {choices.map((ko, i) => (
          <button
            key={i}
            onClick={() => handleSelect(ko)}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left transition-all ${choiceStyle(ko)}`}
          >
            <span className="text-sm font-medium text-gray-800 flex-1 leading-relaxed">{ko}</span>
            {answered && ko === correctKo && <Check size={18} className="text-[#4CAF50] flex-shrink-0" />}
            {answered && ko === selected && ko !== correctKo && <X size={18} className="text-red-400 flex-shrink-0" />}
          </button>
        ))}
      </div>

      <QuizFeedback isCorrect={isCorrect} answered={answered} correctLabel={correctKo} onNext={handleNext} isLast={currentIndex + 1 >= deck.length} />
    </>
  )
}

/* ─── Shared components ─────────────────────────────────── */
function QuizProgress({ current, total, results }) {
  return (
    <>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-gray-400">{current + 1} / {total}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-[#FF5722] h-2 rounded-full transition-all duration-300" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm grid grid-cols-3 divide-x divide-gray-100">
        <div className="text-center px-3">
          <div className="text-xl font-black text-[#4CAF50]">{results.known}</div>
          <div className="text-xs text-gray-400 mt-0.5">정답</div>
        </div>
        <div className="text-center px-3">
          <div className="text-xl font-black text-red-400">{results.unknown}</div>
          <div className="text-xs text-gray-400 mt-0.5">오답</div>
        </div>
        <div className="text-center px-3">
          <div className="text-xl font-black text-gray-400">{total - current - 1}</div>
          <div className="text-xs text-gray-400 mt-0.5">남은 문제</div>
        </div>
      </div>
    </>
  )
}

function QuizFeedback({ isCorrect, answered, correctLabel, onNext, isLast }) {
  if (!answered) return null
  return (
    <div className={`rounded-2xl p-4 text-center ${isCorrect ? 'bg-[#4CAF50]/10' : 'bg-red-50'}`}>
      <p className={`font-black text-base ${isCorrect ? 'text-[#4CAF50]' : 'text-red-500'}`}>
        {isCorrect ? '🎉 정답!' : `❌ 오답 — 정답: ${correctLabel}`}
      </p>
      <button
        onClick={onNext}
        className="mt-3 px-6 py-2.5 rounded-xl bg-[#FF5722] text-white font-bold text-sm hover:bg-[#E64A19] transition-colors"
      >
        {isLast ? '결과 보기' : '다음 문제 →'}
      </button>
    </div>
  )
}

function QuizResult({ results, total, onRestart, wrongAnswers = [] }) {
  const [showWrong, setShowWrong] = useState(false)
  const rate = Math.round((results.known / total) * 100)
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-4">
      <div className="text-6xl animate-bounce">🎉</div>
      <div>
        <h2 className="text-2xl font-black text-gray-900">퀴즈 완료!</h2>
        <p className="text-gray-400 mt-1">¡Muy bien! 오늘도 수고했어요</p>
      </div>
      <div className="bg-white rounded-2xl p-6 w-full shadow-sm space-y-4">
        <div>
          <div className="text-5xl font-black" style={{ color: rate >= 70 ? '#4CAF50' : rate >= 40 ? '#F59E0B' : '#EF4444' }}>{rate}%</div>
          <p className="text-gray-400 text-sm mt-1">정답률</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#4CAF50]/10 rounded-xl p-4">
            <div className="text-3xl font-black text-[#4CAF50]">{results.known}</div>
            <div className="text-xs text-gray-500 mt-0.5">정답 ✓</div>
          </div>
          <button
            onClick={() => wrongAnswers.length > 0 && setShowWrong(v => !v)}
            className={`rounded-xl p-4 transition-all ${wrongAnswers.length > 0 ? 'bg-red-50 hover:bg-red-100 active:scale-[0.98] cursor-pointer' : 'bg-red-50'}`}
          >
            <div className="text-3xl font-black text-red-500">{results.unknown}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              오답 ✗ {wrongAnswers.length > 0 && <span className="text-red-400">{showWrong ? '▲' : '▼'}</span>}
            </div>
          </button>
        </div>

        {/* Wrong answers review */}
        {showWrong && wrongAnswers.length > 0 && (
          <div className="space-y-2 text-left">
            <p className="text-xs font-bold text-red-400 flex items-center gap-1">
              <X size={12} />
              오답 복습 ({wrongAnswers.length}개)
            </p>
            {wrongAnswers.map((item, i) => (
              <div key={i} className="bg-red-50/50 border border-red-100 rounded-xl p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-black text-gray-900">{item.word}</p>
                  <SpeakButton text={item.word} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#4CAF50] bg-[#4CAF50]/10 px-1.5 py-0.5 rounded">정답</span>
                  <span className="text-xs text-gray-700 font-medium">{item.meaning}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded">선택</span>
                  <span className="text-xs text-red-400 line-through">{item.selected}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400">
          {rate >= 80 ? '🔥 완벽해요! 실전에서 바로 쓸 수 있어요!' : rate >= 50 ? '💪 잘하고 있어요! 조금만 더 연습해봐요' : '📖 틀린 단어들을 다시 복습해볼까요?'}
        </p>
      </div>
      <button onClick={onRestart} className="w-full py-4 rounded-2xl bg-[#FF5722] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#E64A19] transition-colors">
        <RotateCcw size={18} />
        다시 퀴즈 시작
      </button>
    </div>
  )
}

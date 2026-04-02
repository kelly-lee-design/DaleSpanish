import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Pencil, Target, GraduationCap, Save, CheckCircle, ArrowLeft } from 'lucide-react'
import { CHARACTERS } from '../hooks/useProfile'

const LEVELS = [
  { id: 'A1', label: 'A1', desc: '초급' },
  { id: 'A2', label: 'A2', desc: '중급' },
  { id: 'B1', label: 'B1', desc: '고급' },
]

export default function ProfileSettings({ profile, saveProfile, displayName, character, setView }) {
  const [nickname, setNickname] = useState(profile.nickname)
  const [selectedChar, setSelectedChar] = useState(profile.character)
  const [motto, setMotto] = useState(profile.motto)
  const [level, setLevel] = useState(profile.level)
  const [saved, setSaved] = useState(false)
  const [nicknameError, setNicknameError] = useState('')

  const validateNickname = (v) => {
    if (v.length > 0 && v.length < 2) return '2자 이상 입력해주세요'
    if (v.length > 10) return '10자 이하로 입력해주세요'
    return ''
  }

  const handleNicknameChange = (e) => {
    const v = e.target.value.slice(0, 10)
    setNickname(v)
    setNicknameError(validateNickname(v))
  }

  const handleSave = () => {
    const err = validateNickname(nickname)
    if (err) { setNicknameError(err); return }

    saveProfile({
      nickname: nickname.trim(),
      character: selectedChar,
      motto: motto.trim(),
      level,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const previewChar = CHARACTERS.find((c) => c.id === selectedChar) || CHARACTERS[0]

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <motion.button
          onClick={() => setView('dashboard')}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 flex items-center justify-center rounded-[16px] bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">프로필 설정</h1>
          <p className="text-sm text-gray-400">나만의 프로필을 꾸며보세요</p>
        </div>
      </div>

      {/* Preview Card */}
      <motion.div
        layout
        className="bg-gradient-to-br from-[#FF5722] to-[#FF8A65] rounded-[24px] p-6 text-white shadow-lg"
      >
        <div className="flex items-center gap-4">
          <motion.div
            key={selectedChar}
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="w-20 h-20 rounded-[20px] bg-white/20 backdrop-blur-sm flex-shrink-0 overflow-hidden flex items-center justify-center"
          >
            <img src={previewChar.src} alt={previewChar.label} className="w-[180%] h-[180%] object-cover" />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="inline-block px-2.5 py-0.5 bg-white/20 rounded-full text-[11px] font-bold mb-1">
              {LEVELS.find((l) => l.id === level)?.desc} · {level}
            </div>
            <p className="text-xl font-black truncate">
              {nickname.trim() || displayName}
            </p>
            {motto && (
              <p className="text-white/80 text-sm mt-0.5 truncate">"{motto}"</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-6">
        {/* Character Selection */}
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-3">
            <User size={15} className="text-[#FF5722]" />
            프로필 캐릭터
          </label>
          <div className="grid grid-cols-4 gap-3">
            {CHARACTERS.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => setSelectedChar(c.id)}
                whileTap={{ scale: 0.9 }}
                className={`relative flex flex-col items-center rounded-[20px] pt-2 pb-2 transition-all border-2 overflow-hidden ${
                  selectedChar === c.id
                    ? 'bg-[#FF5722]/10 border-[#FF5722] shadow-md'
                    : 'bg-gray-50 border-transparent hover:bg-gray-100'
                }`}
              >
                <motion.div
                  className="w-full aspect-square flex items-center justify-center overflow-hidden"
                  animate={selectedChar === c.id ? {
                    y: [0, -6, 0],
                    rotate: [0, -3, 3, 0],
                  } : {}}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <img
                    src={c.src}
                    alt={c.label}
                    className="w-[180%] h-[180%] object-cover"
                  />
                </motion.div>
                {selectedChar === c.id && (
                  <motion.div
                    layoutId="charCheck"
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#FF5722] rounded-full flex items-center justify-center shadow-sm z-10"
                  >
                    <CheckCircle size={14} className="text-white" />
                  </motion.div>
                )}
                <span className="text-xs text-gray-500 mt-1 font-semibold">{c.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Nickname */}
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
            <Pencil size={15} className="text-[#FF5722]" />
            닉네임
          </label>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="2~10자 닉네임"
            maxLength={10}
            className={`w-full px-4 py-3.5 rounded-[16px] border-2 transition-all focus:outline-none ${
              nicknameError
                ? 'border-red-400 bg-red-50/50'
                : 'border-gray-100 focus:border-[#FF5722] bg-gray-50 focus:bg-white'
            } text-gray-900 placeholder-gray-300 font-medium`}
          />
          <div className="flex justify-between mt-1.5 px-1">
            {nicknameError ? (
              <p className="text-xs text-red-500 font-medium">{nicknameError}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-300 font-medium">{nickname.length}/10</p>
          </div>
        </div>

        {/* Motto */}
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
            <Target size={15} className="text-[#FF5722]" />
            나의 다짐
          </label>
          <input
            type="text"
            value={motto}
            onChange={(e) => setMotto(e.target.value.slice(0, 30))}
            placeholder="학습 목표를 입력해주세요"
            maxLength={30}
            className="w-full px-4 py-3.5 rounded-[16px] border-2 border-gray-100 bg-gray-50 focus:border-[#FF5722] focus:bg-white focus:outline-none text-gray-900 placeholder-gray-300 font-medium transition-all"
          />
          <p className="text-xs text-gray-300 text-right mt-1.5 px-1 font-medium">{motto.length}/30</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Level */}
        <div>
          <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-3">
            <GraduationCap size={15} className="text-[#FF5722]" />
            학습 레벨
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {LEVELS.map((l) => (
              <motion.button
                key={l.id}
                onClick={() => setLevel(l.id)}
                whileTap={{ scale: 0.95 }}
                className={`py-3.5 rounded-[16px] text-center transition-all ${
                  level === l.id
                    ? 'bg-[#FF5722] text-white shadow-md font-bold'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-2 border-gray-100'
                }`}
              >
                <span className="text-xl font-black block">{l.label}</span>
                <span className="block text-[11px] mt-0.5 opacity-80">{l.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        whileTap={{ scale: 0.95 }}
        disabled={!!nicknameError}
        className="w-full py-4 rounded-[24px] bg-[#FF5722] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg hover:bg-[#E64A19] transition-colors disabled:opacity-40"
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span
              key="saved"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <CheckCircle size={18} />
              저장 완료!
            </motion.span>
          ) : (
            <motion.span
              key="save"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Save size={18} />
              저장하기
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

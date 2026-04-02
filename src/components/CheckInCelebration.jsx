import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Confetti particle ──
function Confetti({ count = 40 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.2 + Math.random() * 1.2,
        size: 6 + Math.random() * 6,
        color: ['#FF5722', '#FF8A65', '#FFB74D', '#FFF176', '#FFCC80', '#FF7043'][
          Math.floor(Math.random() * 6)
        ],
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count]
  )

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: '110vh',
            x: `calc(${p.x}vw + ${p.drift}px)`,
            opacity: [1, 1, 0],
            rotate: p.rotation + 720,
            scale: [1, 1, 0.5],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

// ── Main Celebration Overlay ──
export default function CheckInCelebration({ streak, onDismiss }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 500)
    }, 3500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <>
          <Confetti />

          {/* Overlay backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-[59]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setVisible(false)
              setTimeout(onDismiss, 300)
            }}
          />

          {/* Character + speech bubble */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[61] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center gap-3 pointer-events-auto">
              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
                className="bg-white rounded-2xl px-6 py-3 shadow-xl relative"
              >
                <p className="text-sm font-black text-[#FF5722] text-center">
                  ¡Muy bien!
                </p>
                <p className="text-xs text-gray-500 text-center mt-0.5">
                  아주 잘했어요! 🔥 연속 {streak}일차
                </p>
                {/* Bubble tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm" />
              </motion.div>

              {/* Character image */}
              <motion.div
                initial={{ y: 200, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              >
                <motion.img
                  src="/assets/orange-splash-2.png"
                  alt="DALE character celebrating"
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                  animate={{ rotate: [-3, 3, -3] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                  onError={(e) => {
                    e.target.src = '/assets/orange-character.png'
                  }}
                />
              </motion.div>

              {/* Streak badge */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 400, damping: 15 }}
                className="bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white px-5 py-2 rounded-full shadow-lg"
              >
                <span className="text-sm font-black">🔥 {streak}일 연속 출석!</span>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

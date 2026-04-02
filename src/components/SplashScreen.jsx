import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CHARACTERS = [
  '/assets/character_orange_star_sit_happy.png',
  '/assets/character_orange_basic_welcome.png',
  '/assets/character_orange_star_jump.png',
  '/assets/character_orange_star_welcome.png',
]

// Preload images to avoid flicker
function usePreloadImages(srcs) {
  const loaded = useRef(false)
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    srcs.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [srcs])
}

// Sparkle that pops, spins, and fades
function Sparkle({ delay, x, y, size = 8 }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.4, 1, 0],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration: 1.6,
        delay,
        ease: 'easeInOut',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
          fill="#FF5722"
          fillOpacity={0.3}
        />
      </svg>
    </motion.div>
  )
}

export default function SplashScreen({ onFinish, showLogo = true }) {
  const [step, setStep] = useState(0)
  const [showSparkles, setShowSparkles] = useState(false)

  usePreloadImages(CHARACTERS)

  useEffect(() => {
    // Step 0: sitting character bounces in (0 ~ 0.7s)
    // Step 1: basic welcome arms open (0.7s ~ 1.2s)
    const t1 = setTimeout(() => setStep(1), 700)
    // Step 2: jump! (1.2s ~ 1.7s)
    const t2 = setTimeout(() => setStep(2), 1200)
    // Step 3: hero landing pose (1.7s ~ 2.4s)
    const t3 = setTimeout(() => setStep(3), 1700)
    // Sparkles burst at final pose
    const t4 = setTimeout(() => setShowSparkles(true), 1900)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-[#FFF9F2] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main center glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[420px] h-[420px] rounded-full bg-[#FF5722]/[0.04] blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Floating soft circles */}
        <motion.div
          className="absolute top-[12%] left-[8%] w-20 h-20 rounded-full bg-[#FFDDD2]/40 blur-2xl"
          animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[18%] right-[10%] w-16 h-16 rounded-full bg-[#FFE8B2]/30 blur-2xl"
          animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-[22%] left-[15%] w-14 h-14 rounded-full bg-[#FFDDD2]/25 blur-xl"
          animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-[28%] right-[12%] w-12 h-12 rounded-full bg-[#FFE0D6]/30 blur-xl"
          animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />

        {/* Tiny floating dots */}
        <motion.div
          className="absolute top-[30%] left-[22%] w-2 h-2 rounded-full bg-[#FF5722]/10"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[25%] right-[20%] w-1.5 h-1.5 rounded-full bg-[#FF5722]/8"
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
        <motion.div
          className="absolute bottom-[35%] left-[30%] w-1.5 h-1.5 rounded-full bg-[#FFB74D]/15"
          animate={{ y: [0, -14, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        />
        <motion.div
          className="absolute top-[40%] right-[25%] w-2 h-2 rounded-full bg-[#FFB74D]/10"
          animate={{ y: [0, -16, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </div>

      {/* Character area */}
      <div className="relative w-72 h-72 -mt-8">
        {/* Animated shadow that reacts to character */}
        <motion.div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/[0.06] blur-md"
          initial={{ opacity: 0, width: 80, height: 12, scaleX: 0.5 }}
          animate={{
            opacity: step === 2 ? 0.3 : step === 0 ? 0.6 : 1,
            width: step === 0 ? 100 : step === 2 ? 80 : step === 1 ? 140 : 160,
            height: step === 2 ? 8 : step === 0 ? 12 : 20,
            scaleX: step === 2 ? 0.6 : 1,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Sparkles */}
        {showSparkles && (
          <>
            <Sparkle delay={0} x="8%" y="15%" size={14} />
            <Sparkle delay={0.15} x="82%" y="10%" size={11} />
            <Sparkle delay={0.3} x="5%" y="60%" size={10} />
            <Sparkle delay={0.2} x="88%" y="55%" size={12} />
            <Sparkle delay={0.4} x="50%" y="5%" size={9} />
          </>
        )}

        <AnimatePresence mode="wait">
          {/* Step 0: Sitting character — drops in with bounce and wobble */}
          {step === 0 && (
            <motion.img
              key="char-0"
              src={CHARACTERS[0]}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              initial={{ opacity: 0, y: 80, scale: 0.6, rotate: -8 }}
              animate={{
                opacity: 1,
                y: [80, -10, 5, 0],
                scale: [0.6, 1.08, 0.96, 1.0],
                rotate: [-8, 4, -2, 0],
              }}
              exit={{ opacity: 0, scale: 0.85, y: -20 }}
              transition={{
                duration: 0.8,
                times: [0, 0.45, 0.75, 1],
                ease: 'easeOut',
                exit: { duration: 0.25 },
              }}
            />
          )}

          {/* Step 1: Basic welcome — springs up with stretch and wiggle */}
          {step === 1 && (
            <motion.img
              key="char-1"
              src={CHARACTERS[1]}
              alt=""
              className="absolute inset-0 w-full h-full object-contain"
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{
                opacity: 1,
                scale: [0.5, 1.12, 0.95, 1.02, 1.0],
                y: [30, -15, 5, 0],
                rotate: [0, -5, 5, -2, 0],
              }}
              exit={{ opacity: 0, scale: 1.1, y: -15 }}
              transition={{
                duration: 0.7,
                scale: { duration: 0.7, times: [0, 0.35, 0.6, 0.8, 1], ease: 'easeOut' },
                y: { duration: 0.7, times: [0, 0.4, 0.7, 1], ease: 'easeOut' },
                rotate: { duration: 0.7, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeOut' },
                exit: { duration: 0.2 },
              }}
            />
          )}

          {/* Step 2: Jump! — character leaps up high with squash & stretch */}
          {step === 2 && (
            <motion.img
              key="char-2"
              src={CHARACTERS[2]}
              alt=""
              className="absolute inset-0 w-full h-full object-contain drop-shadow-md"
              initial={{ opacity: 0, y: 10, scale: 0.9, scaleY: 0.85, scaleX: 1.1 }}
              animate={{
                opacity: 1,
                y: [10, -45, -50, -45],
                scale: [0.9, 1.1, 1.08, 1.1],
                scaleY: [0.85, 1.15, 1.12, 1.15],
                scaleX: [1.1, 0.92, 0.94, 0.92],
                rotate: [0, -3, 0, 3],
              }}
              exit={{ opacity: 0, y: -30, scale: 1.15 }}
              transition={{
                duration: 0.5,
                times: [0, 0.4, 0.7, 1],
                ease: 'easeOut',
                exit: { duration: 0.2 },
              }}
            />
          )}

          {/* Step 3: Star welcome — hero landing with pop, wiggle, then idle dance */}
          {step === 3 && (
            <motion.div
              key="char-3"
              className="absolute inset-0"
              initial={{ opacity: 0, y: -40, scale: 1.1 }}
              animate={{
                opacity: 1,
                y: [-40, 8, -3, 0],
                scale: [1.1, 0.88, 1.06, 1.0],
                scaleY: [0.9, 1.15, 0.95, 1.0],
                scaleX: [1.1, 0.9, 1.04, 1.0],
                rotate: [4, -3, 1, 0],
              }}
              transition={{
                duration: 0.7,
                times: [0, 0.35, 0.65, 1],
                ease: 'easeOut',
              }}
            >
              <motion.img
                src={CHARACTERS[3]}
                alt=""
                className="w-full h-full object-contain drop-shadow-lg"
                animate={{
                  y: [0, -8, 0, -4, 0],
                  rotate: [0, -2, 0, 2, 0],
                  scale: [1, 1.02, 1, 1.01, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.7,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logo & text area */}
      {showLogo && (
        <div className="mt-4 text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{
              opacity: 1,
              scale: [0.3, 1.08, 1.0],
              y: [20, -3, 0],
            }}
            transition={{
              duration: 0.6,
              delay: 0.3,
              scale: { duration: 0.6, times: [0, 0.6, 1], ease: 'easeOut' },
            }}
            className="text-6xl font-black text-[#FF5722] tracking-tight leading-none"
          >
            ¡DALE!
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5, ease: 'easeOut' }}
            className="mt-2.5 space-y-0.5"
          >
            <p className="text-lg font-black text-[#FF5722]/70">기록을 실전 문장으로</p>
            <p className="text-sm font-medium text-gray-400">나만의 맞춤형 복습 아지트</p>
          </motion.div>
        </div>
      )}

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.3 }}
        className="flex gap-2 mt-8"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[#FF5722]/30"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.7, 1.4, 0.7],
              y: [0, -3, 0],
            }}
            transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>
    </div>
  )
}

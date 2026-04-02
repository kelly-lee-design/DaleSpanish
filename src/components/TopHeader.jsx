import { Bell, Flame } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TopHeader({ setView, character, unreadCount = 0, onBellClick, currentStreak = 0 }) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:hidden">
      {/* Logo */}
      <motion.button
        onClick={() => setView('dashboard')}
        whileTap={{ scale: 0.95 }}
        className="text-2xl font-black text-[#FF5722] tracking-tight"
      >
        ¡DALE!
      </motion.button>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Streak */}
        <motion.button
          onClick={() => setView('streak')}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
        >
          <Flame size={14} className="text-[#FF5722]" />
          <span className="text-xs font-bold text-[#FF5722]">{currentStreak}일</span>
        </motion.button>

        {/* Notification bell */}
        <motion.button
          onClick={onBellClick}
          whileTap={{ scale: 0.9 }}
          className="relative w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-[#FF5722] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>

        {/* Profile avatar */}
        <motion.button
          onClick={() => setView('profile')}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full overflow-hidden bg-[#FF5722]/10 ring-2 ring-[#FF5722]/20 flex items-center justify-center"
        >
          {character ? (
            <img src={character.src} alt="profile" className="w-[180%] h-[180%] object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-[#FF5722] flex items-center justify-center text-white font-black text-sm">
              ?
            </div>
          )}
        </motion.button>
      </div>
    </header>
  )
}

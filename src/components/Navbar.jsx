import { LayoutDashboard, Plus, BookOpen, Brain, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

const NAV_ITEMS = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'input', label: '단어 추가', icon: Plus },
  { id: 'library', label: '단어장', icon: BookOpen },
  { id: 'quiz', label: '퀴즈', icon: Brain },
]

export default function Navbar({ view, setView, variant }) {
  const { user, isGuest, signOut } = useAuth()

  const displayName = user?.email?.split('@')[0] ?? (isGuest ? '게스트' : null)
  const avatarLetter = displayName?.[0]?.toUpperCase() ?? '?'
  const showUser = isSupabaseConfigured || isGuest

  if (variant === 'sidebar') {
    return (
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 shadow-sm z-50">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-3xl font-black text-[#FF5722] tracking-tight">¡DALE!</h1>
          <p className="text-xs text-gray-400 mt-0.5">스페인어 회화 복습 🇪🇸</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                view === id
                  ? 'bg-[#FFF5EE] text-[#FF5722] shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={id === 'input' ? 20 : 18} strokeWidth={id === 'input' ? 2.5 : 2} />
              {label}
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          {showUser && displayName && (
            <button
              onClick={() => setView('profile')}
              className="w-full flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF5722] flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                {avatarLetter}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400">{isGuest ? '게스트 모드' : '로그인됨'}</p>
              </div>
              <Settings size={14} className="text-gray-400" />
            </button>
          )}
          {showUser ? (
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          ) : (
            <p className="text-xs text-gray-400 text-center">¡Tú puedes hacerlo! 💪</p>
          )}
        </div>
      </aside>
    )
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all ${
              view === id ? 'text-[#FF5722]' : 'text-gray-400'
            }`}
          >
            <Icon
              size={id === 'input' ? 24 : 22}
              strokeWidth={id === 'input' ? 2.5 : 2}
              className={`transition-transform ${view === id ? 'scale-110' : ''}`}
            />
            <span className={view === id ? 'font-bold' : ''}>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

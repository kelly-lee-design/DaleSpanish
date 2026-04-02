import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, continueAsGuest } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password)
        setSuccess('가입 완료! 이메일을 확인하고 인증 링크를 클릭해주세요.')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      const msg = err.message || '오류가 발생했습니다.'
      if (msg.includes('Invalid login')) setError('이메일 또는 비밀번호가 올바르지 않아요.')
      else if (msg.includes('already registered')) setError('이미 가입된 이메일이에요. 로그인해주세요.')
      else if (msg.includes('Email not confirmed')) setError('이메일 인증이 필요해요. 받은 편지함을 확인해주세요.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || '구글 로그인 중 오류가 발생했습니다.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-[#FF5722] tracking-tight">¡DALE!</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">스페인어 회화 복습 서비스 🇪🇸</p>
        </div>

        {/* Supabase not configured notice */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
              <Info size={14} />
              Supabase 미설정 — 게스트 모드 사용 가능
            </p>
            <p className="text-xs text-amber-600 leading-relaxed">
              로그인을 사용하려면 <strong>.env</strong> 파일에 아래 항목을 추가하세요:
            </p>
            <code className="block text-xs bg-amber-100 rounded-lg p-2 text-amber-800 leading-relaxed">
              VITE_SUPABASE_URL=https://xxx.supabase.co<br />
              VITE_SUPABASE_ANON_KEY=your_anon_key
            </code>
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#FF5722] font-bold underline"
            >
              supabase.com → 무료 가입 (50,000 MAU 무료)
            </a>
          </div>
        )}

        {/* Auth card */}
        {isSupabaseConfigured && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            {/* Tab toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => { setMode('signin'); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                }`}
              >
                로그인
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                }`}
              >
                회원가입
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40 focus:border-[#FF5722] text-sm transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자 이상)"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40 focus:border-[#FF5722] text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error / Success */}
              {error && (
                <div className="flex items-start gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-xl">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 text-[#4CAF50] text-xs bg-[#4CAF50]/10 p-3 rounded-xl">
                  <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-xl bg-[#FF5722] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E64A19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : mode === 'signin' ? (
                  '로그인'
                ) : (
                  '회원가입'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">또는</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 계속하기
                </>
              )}
            </button>
          </div>
        )}

        {/* Guest mode */}
        <div className="text-center">
          <button
            onClick={continueAsGuest}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            로그인 없이 게스트로 계속하기 →
          </button>
        </div>

        <p className="text-center text-xs text-gray-300">
          ¡Tú puedes hacerlo! 💪
        </p>
      </div>
    </div>
  )
}

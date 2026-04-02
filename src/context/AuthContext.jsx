import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // guest = using app without login (localStorage only)
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('dale_guest') === 'true'
  })

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setIsGuest(false)
    localStorage.removeItem('dale_guest')
  }

  const continueAsGuest = () => {
    setIsGuest(true)
    localStorage.setItem('dale_guest', 'true')
  }

  const value = {
    user,
    loading,
    isGuest,
    isAuthenticated: !!user || isGuest || !isSupabaseConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    continueAsGuest,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

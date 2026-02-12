"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isGuest: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInAsGuest: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const isAuthenticated = !!user || isGuest

  useEffect(() => {
    async function checkAdmin(userId: string) {
      const { data } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()
      setIsAdmin(!!data)
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) checkAdmin(s.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        checkAdmin(s.user.id)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signInAsGuest = useCallback(() => {
    setIsGuest(true)
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsGuest(false)
    setIsAdmin(false)
  }, [])

  const contextValue = useMemo(
    () => ({ user, session, loading, isGuest, isAuthenticated, isAdmin, signUp, signIn, signInAsGuest, signOut }),
    [user, session, loading, isGuest, isAuthenticated, isAdmin, signUp, signIn, signInAsGuest, signOut]
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

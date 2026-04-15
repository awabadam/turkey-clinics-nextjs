"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: sbUser },
      } = await supabase.auth.getUser()
      setSupabaseUser(sbUser)

      if (sbUser) {
        try {
          const dbUser = await api.get<User>("/auth/me")
          setUser(dbUser)
        } catch {
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        try {
          const dbUser = await api.get<User>("/auth/me")
          setUser(dbUser)
        } catch {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)
  }

  const register = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
    if (error) throw new Error(error.message)

    // Sync user to database
    if (data.user) {
      await fetch("/api/auth/signup-sync", { method: "POST" })
    }

    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  return { user, supabaseUser, isLoading, login, register, logout }
}

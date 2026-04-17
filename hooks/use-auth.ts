"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const dbUser = await api.get<User>("/auth/me")
        setUser(dbUser)
      } catch {
        setUser(null)
      }
      setIsLoading(false)
    }

    getUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post<{ user: User }>("/auth/login", {
      email,
      password,
    })
    setUser(response.user)
  }

  const register = async (email: string, password: string, name?: string) => {
    const response = await api.post<{ user: User }>("/auth/register", {
      email,
      password,
      name,
    })
    setUser(response.user)
  }

  const logout = async () => {
    await api.post("/auth/logout")
    setUser(null)
  }

  return { user, isLoading, login, register, logout }
}

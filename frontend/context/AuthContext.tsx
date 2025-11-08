// frontend/context/AuthContext.tsx
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User{ 
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string, role: 'student' | 'professor' | 'admin' | 'Engineer' | 'Others') => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
  }, [])

  const api = async (endpoint: string, body: any) => {
  const res = await fetch(`http://localhost:3001/api${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  
    },
    body: JSON.stringify(body),
  })
    if (!res.ok) throw new Error((await res.json()).message)
    return res.json()
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api('/auth/login', { email, password })
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'student' | 'professor' | 'admin' | 'Engineer' | 'Others'
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      await api('/auth/register', { email, password, firstName, lastName, role })
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.clear()
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
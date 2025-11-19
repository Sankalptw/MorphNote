// frontend/context/AuthContext.tsx
'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
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

// Microservices API Gateway URL
const API_GATEWAY = 'http://localhost:5000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load token and user from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Error loading auth from storage:', e)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_GATEWAY}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()

      // Transform microservice response to your format
      const userData: User = {
        id: data.userId,
        email: data.email,
        firstName: data.name?.split(' ')[0] || 'User',
        lastName: data.name?.split(' ').slice(1).join(' ') || '',
        role: data.role || 'student', // Default role if not provided
      }

      setToken(data.token)
      setUser(userData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Login failed'
      setError(errorMessage)
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
      const fullName = `${firstName} ${lastName}`.trim()

      const response = await fetch(`${API_GATEWAY}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: fullName,
          role, // Include role if backend supports it
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()

      // After successful registration, auto-login
      const userData: User = {
        id: data.userId,
        email: data.email,
        firstName,
        lastName,
        role,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))

      // Now login to get token
      await login(email, password)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Registration failed'
      setError(errorMessage)
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setError(null)
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
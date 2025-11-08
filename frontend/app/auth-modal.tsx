'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Loader, X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'student' | 'professor' | 'admin' | 'Engineer' | 'Others'>('student')
  const { login, register, isLoading, error } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password, firstName, lastName, role)
      }
      router.push('/dashboard')
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
    setRole('student')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-background rounded-xl p-8 relative border border-border/40">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/60 hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="px-4 py-2 rounded-lg bg-foreground/5 border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="px-4 py-2 rounded-lg bg-foreground/5 border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'professor' | 'admin' | 'Engineer' | 'Others')}
                className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                style={{
                  colorScheme: 'light',
                }}>
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="admin">Admin</option>
                <option value="Engineer">Engineer</option>
                <option value="others">Other</option>

              </select>
            </>
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          onClick={toggleAuthMode}
          className="w-full text-sm text-foreground/60 hover:text-foreground mt-4 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}
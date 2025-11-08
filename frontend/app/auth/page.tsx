'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Loader, X } from 'lucide-react'

interface AuthModalProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AuthPage({ isOpen = true, onClose }: AuthModalProps = {}) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, register, isLoading, error } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      isLogin ? await login(email, password) : await register(email, password)
      router.push('/')
      onClose?.()
    } catch {}
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="w-full max-w-md bg-background rounded-lg p-8 relative">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-foreground/60 hover:text-foreground">
            <X size={20} />
          </button>
        )}

        <h1 className="text-2xl font-bold text-foreground mb-6">{isLogin ? 'Login' : 'Register'}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-2 bg-red-500/10 text-red-500 rounded text-sm">{error}</div>}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-sm text-foreground/60 hover:text-foreground mt-4"
        >
          {isLogin ? "Don't have account? Register" : 'Have account? Login'}
        </button>
      </div>
    </div>
  )
}

export { AuthPage }
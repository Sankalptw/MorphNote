'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { LogOut, Settings } from 'lucide-react'

export default function ProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleSettings = () => {
    router.push('/dashboard/settings')
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-foreground/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
          {user.email[0].toUpperCase()}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-lg min-w-48 z-50">
          <div className="p-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.email}</p>
            <p className="text-xs text-foreground/60 capitalize">{user.role}</p>
          </div>
          
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-foreground/10 transition-colors"
          >
            <Settings size={16} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
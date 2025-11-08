'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, User, Lock, Settings, HelpCircle, Info, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TabType = 'profile' | 'password' | 'preferences' | 'help' | 'about'

export default function ProfileSettings() {
  const { user, logout, token } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Profile state
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [bio, setBio] = useState('')

  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Preferences state
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState('medium')
  const [emailNotifications, setEmailNotifications] = useState(true)

  const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setMessage('')
  try {
    const res = await fetch('http://localhost:3001/api/user/update-profile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // ADD THIS
      },
      body: JSON.stringify({ firstName, lastName, bio }),
    })
    if (res.ok) {
      setMessage('Profile updated successfully!')
    } else {
      setMessage('Failed to update profile')
    }
  } catch (err) {
    setMessage('Error updating profile')
  } finally {
    setLoading(false)
  }
}

  const handlePasswordChange = async (e: React.FormEvent) => {
  e.preventDefault()
  if (newPassword !== confirmPassword) {
    setMessage('Passwords do not match')
    return
  }
  setLoading(true)
  setMessage('')
  try {
    const res = await fetch('http://localhost:3001/api/user/change-password', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // ADD THIS
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    })
    if (res.ok) {
      setMessage('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      const error = await res.json()
      setMessage(error.message || 'Failed to change password')
    }
  } catch (err) {
    setMessage('Error changing password')
  } finally {
    setLoading(false)
  }
}
      
  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-foreground/10'
                }`}
              >
                <User size={18} />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-foreground/10'
                }`}
              >
                <Lock size={18} />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-foreground/10'
                }`}
              >
                <Settings size={18} />
                <span>Preferences</span>
              </button>

              <button
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'help'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-foreground/10'
                }`}
              >
                <HelpCircle size={18} />
                <span>Help</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'about'
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-foreground/10'
                }`}
              >
                <Info size={18} />
                <span>About</span>
              </button>

              <hr className="my-4 border-border/40" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            {/* Edit Profile */}
            {activeTab === 'profile' && (
              <div className="bg-foreground/5 border border-border/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                      message.includes('success') || message.includes('successfully')
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground/50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <input
                      type="text"
                      value={user?.role}
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground/50 cursor-not-allowed capitalize"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={4}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Change Password */}
            {activeTab === 'password' && (
              <div className="bg-foreground/5 border border-border/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                      message.includes('success') || message.includes('successfully')
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <div className="bg-foreground/5 border border-border/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Preferences</h2>
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-3">Theme</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={theme === 'light'}
                          onChange={(e) => setTheme(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>Light</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={theme === 'dark'}
                          onChange={(e) => setTheme(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>Dark</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Email Notifications</span>
                  </label>

                  <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Help */}
            {activeTab === 'help' && (
              <div className="bg-foreground/5 border border-border/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Help & Documentation</h2>
                <div className="space-y-4 text-foreground/80">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Getting Started</h3>
                    <p>Create your first note by clicking the "New Note" button on the left sidebar.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Using AI Features</h3>
                    <p>Use Summarize, Extract Key Points, and Restyle to enhance your notes with AI assistance.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Keyboard Shortcuts</h3>
                    <p>Press Ctrl+S to save, Ctrl+N to create a new note.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Contact Support</h3>
                    <p>Email us at support@morphnote.com for further assistance.</p>
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {activeTab === 'about' && (
              <div className="bg-foreground/5 border border-border/40 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">About MorphNote</h2>
                <div className="space-y-4 text-foreground/80">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Version</h3>
                    <p>MorphNote v1.0.0</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">About Us</h3>
                    <p>MorphNote is an AI-powered note-taking application designed for students and educators to create, organize, and enhance their notes with intelligent features.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Privacy</h3>
                    <p>We respect your privacy. Read our Privacy Policy for more information.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Terms</h3>
                    <p>By using MorphNote, you agree to our Terms of Service.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'
import { X, Share2, Trash2, Copy, Check } from 'lucide-react'

interface NoteShare {
  id: string
  sharedWith: string
  permission: string
}

interface ShareModalProps {
  noteId: string
  onClose: () => void
  token: string | null
}

export default function ShareModal({ noteId, onClose, token }: ShareModalProps) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [shares, setShares] = useState<NoteShare[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchShares()
  }, [])

  const fetchShares = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/features/notes/${noteId}/shares`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setShares(data.shares)
      }
    } catch (e) {
      console.error('Error fetching shares:', e)
    }
  }

  const shareNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/features/notes/${noteId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sharedWith: email, permission }),
      })

      if (res.ok) {
        setEmail('')
        fetchShares()
      }
    } catch (e) {
      console.error('Error sharing note:', e)
    } finally {
      setLoading(false)
    }
  }

  const removeShare = async (shareId: string) => {
    try {
      await fetch(`http://localhost:3001/api/features/shares/${shareId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchShares()
    } catch (e) {
      console.error('Error removing share:', e)
    }
  }

  const copyShareLink = () => {
    const link = `${window.location.origin}/notes/${noteId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-background border border-border rounded-lg w-full max-w-md p-6 relative'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-2 hover:bg-foreground/10 rounded-lg transition-colors'
        >
          <X size={20} />
        </button>

        <div className='flex items-center gap-2 mb-4'>
          <Share2 size={20} />
          <h2 className='text-xl font-bold'>Share Note</h2>
        </div>

        {/* Copy Link */}
        <div className='mb-6 p-3 bg-foreground/5 rounded-lg border border-border'>
          <p className='text-xs text-foreground/60 mb-2'>Share Link</p>
          <button
            onClick={copyShareLink}
            className='w-full flex items-center gap-2 px-3 py-2 bg-background border border-border rounded hover:bg-foreground/5 transition-colors text-sm'
          >
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Share with Email */}
        <form onSubmit={shareNote} className='mb-6 space-y-3'>
          <div>
            <label className='block text-sm font-medium mb-1'>Share with email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='someone@example.com'
              className='w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Permission</label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
              className='w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
            >
              <option value='view'>View Only</option>
              <option value='edit'>Can Edit</option>
            </select>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-all'
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </form>

        {/* Current Shares */}
        <div>
          <h3 className='text-sm font-semibold mb-2'>Shared with</h3>
          {shares.length === 0 ? (
            <p className='text-xs text-foreground/50'>Not shared yet</p>
          ) : (
            <div className='space-y-2 max-h-40 overflow-y-auto'>
              {shares.map((share) => (
                <div
                  key={share.id}
                  className='flex items-center justify-between p-2 bg-foreground/5 rounded border border-border/40'
                >
                  <div className='text-sm'>
                    <p className='font-medium'>{share.sharedWith}</p>
                    <p className='text-xs text-foreground/50 capitalize'>{share.permission}</p>
                  </div>
                  <button
                    onClick={() => removeShare(share.id)}
                    className='p-1 hover:bg-red-500/20 rounded transition-colors'
                  >
                    <Trash2 size={16} className='text-red-500' />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
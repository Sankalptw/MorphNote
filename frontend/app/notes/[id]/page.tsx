'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Copy, Check, Share2 } from 'lucide-react'
import Link from 'next/link'

interface Note {
  id: string
  title: string
  desc: string
  createdAt: string
  updatedAt: string
  sharedWith?: Array<{ email: string }>
}

export default function SharedNotePage() {
  const params = useParams()
  const noteId = params.id as string
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    fetchNote()
    setShareUrl(`${window.location.origin}/shared/${noteId}`)
  }, [noteId])

  const fetchNote = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/notes/note/${noteId}`)
      if (res.ok) {
        const data = await res.json()
        setNote(data.note)
      } else {
        setError('Note not found or access denied')
      }
    } catch (e) {
      setError('Error loading note')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportNote = async () => {
    if (!note) return

    try {
      // Simple text export
      const text = `${note.title}\n\n${note.desc}`
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${note.title || 'note'}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error exporting note:', e)
      alert('Failed to export note')
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-background'>
        <div className='text-foreground'>Loading...</div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className='flex items-center justify-center h-screen bg-background'>
        <div className='text-center'>
          <p className='text-foreground mb-4'>{error || 'Note not found'}</p>
          <Link href='/' className='text-primary hover:underline'>
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* Header */}
      <div className='border-b border-border p-4 flex items-center justify-between bg-foreground/2'>
        <div className='flex items-center gap-4'>
          <Link href='/' className='p-2 hover:bg-foreground/10 rounded-lg transition-colors'>
            <ArrowLeft size={20} />
          </Link>
          <h1 className='text-2xl font-bold'>Shared Note</h1>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={copyToClipboard}
            className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-foreground/10 transition-colors text-sm'
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={exportNote}
            className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-foreground/10 transition-colors text-sm'
          >
            <Share2 size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-4xl mx-auto p-8'>
        {/* Title */}
        <h2 className='text-4xl font-bold mb-2 text-foreground'>{note.title}</h2>

        {/* Metadata */}
        <div className='flex items-center gap-4 text-sm text-foreground/60 mb-8 pb-4 border-b border-border'>
          <div>
            Created: {new Date(note.createdAt).toLocaleString()}
          </div>
          <div>
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </div>
          {note.sharedWith && note.sharedWith.length > 0 && (
            <div>
              Shared with {note.sharedWith.length} {note.sharedWith.length === 1 ? 'person' : 'people'}
            </div>
          )}
        </div>

        {/* Note Content */}
        <div className='prose prose-invert max-w-none'>
          <div className='text-foreground whitespace-pre-wrap leading-relaxed bg-foreground/2 p-6 rounded-lg border border-border'>
            {note.desc || 'No content'}
          </div>
        </div>

        {/* Footer Info */}
        <div className='mt-8 pt-6 border-t border-border text-center text-sm text-foreground/50'>
          <p>This is a shared read-only view of the note.</p>
          <Link href='/' className='text-primary hover:underline mt-2 inline-block'>
            Create your own notes
          </Link>
        </div>
      </div>
    </div>
  )
}
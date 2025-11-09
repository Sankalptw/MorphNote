'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Note {
  id: string
  title: string
  desc: string
  createdAt: string
  updatedAt: string
}

export default function SharedNotePage() {
  const params = useParams()
  const noteId = params.id as string
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNote()
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
      <div className='border-b border-border p-4 flex items-center gap-4'>
        <Link href='/' className='p-2 hover:bg-foreground/10 rounded-lg transition-colors'>
          <ArrowLeft size={20} />
        </Link>
        <h1 className='text-2xl font-bold'>Shared Note</h1>
      </div>

      <div className='max-w-4xl mx-auto p-8'>
        <h2 className='text-3xl font-bold mb-4'>{note.title}</h2>
        <div className='text-sm text-foreground/60 mb-6'>
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </div>
        <div className='prose prose-invert max-w-none'>
          <p className='text-foreground whitespace-pre-wrap'>{note.desc}</p>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Sidebar from "@/components/sidebar"
import Editor from "@/components/editor"
import ProfileMenu from "@/components/profile-menu"

interface Note {
  id: string
  title: string
  desc: string
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { token, user } = useAuth()
  const router = useRouter()

  // Load notes from backend
  useEffect(() => {
    if (!token) {
      router.push("/")
      return
    }

    const fetchNotes = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/notes/my-notes", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setNotes(data.notes)
          if (data.notes.length > 0) {
            setCurrentNoteId(data.notes[0].id)
          }
        }
      } catch (e) {
        console.error("Error fetching notes:", e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotes()
  }, [token, router])

  const currentNote = notes.find((note) => note.id === currentNoteId)

  const createNewNote = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/notes/newnote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "Untitled", desc: "" }),
      })

      if (res.ok) {
        const data = await res.json()
        setNotes([data.note, ...notes])
        setCurrentNoteId(data.note.id)
      }
    } catch (e) {
      console.error("Error creating note:", e)
    }
  }

  const updateNote = async (updates: Partial<Note>) => {
    if (!currentNoteId) return

    setNotes(
      notes.map((note) =>
        note.id === currentNoteId ? { ...note, ...updates } : note
      )
    )

    setTimeout(async () => {
      try {
        await fetch(`http://localhost:3001/api/notes/note/${currentNoteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: updates.title || currentNote?.title || "Untitled",
            desc: updates.desc || currentNote?.desc || "",
          }),
        })
      } catch (e) {
        console.error("Error updating note:", e)
      }
    }, 1000)
  }

  const deleteNote = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/notes/note/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const updatedNotes = notes.filter((note) => note.id !== id)
      setNotes(updatedNotes)
      if (currentNoteId === id) {
        setCurrentNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null)
      }
    } catch (e) {
      console.error("Error deleting note:", e)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">MorphNote</h1>
        <ProfileMenu />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          notes={notes}
          currentNoteId={currentNoteId}
          onSelectNote={setCurrentNoteId}
          onCreateNote={createNewNote}
          onDeleteNote={deleteNote}
        />
        <Editor
          note={currentNote as any}
          onUpdateNote={updateNote}
          onCreateNote={createNewNote}
        />
      </div>
    </div>
  )
}
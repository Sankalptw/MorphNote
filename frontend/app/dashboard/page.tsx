"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import Editor from "@/components/editor"

interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        setNotes(parsedNotes)
        if (parsedNotes.length > 0) {
          setCurrentNoteId(parsedNotes[0].id)
        }
      } catch (error) {
        console.error("Error loading notes:", error)
      }
    }
    setIsLoading(false)
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("notes", JSON.stringify(notes))
    }
  }, [notes, isLoading])

  const currentNote = notes.find((note) => note.id === currentNoteId)

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes([newNote, ...notes])
    setCurrentNoteId(newNote.id)
  }

  const updateNote = (updates: Partial<Note>) => {
    if (!currentNoteId) return

    setNotes(
      notes.map((note) =>
        note.id === currentNoteId
          ? {
              ...note,
              ...updates,
              updatedAt: Date.now(),
            }
          : note,
      ),
    )
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id)
    setNotes(updatedNotes)
    if (currentNoteId === id) {
      setCurrentNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null)
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        notes={notes}
        currentNoteId={currentNoteId}
        onSelectNote={setCurrentNoteId}
        onCreateNote={createNewNote}
        onDeleteNote={deleteNote}
      />
      <Editor note={currentNote} onUpdateNote={updateNote} onCreateNote={createNewNote} />
    </div>
  )
}

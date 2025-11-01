"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

interface EditorProps {
  note: Note | undefined
  onUpdateNote: (updates: Partial<Note>) => void
  onCreateNote: () => void
}

export default function Editor({ note, onUpdateNote, onCreateNote }: EditorProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving">("saved")

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.value = note?.title || ""
    }
    if (contentTextareaRef.current) {
      contentTextareaRef.current.value = note?.content || ""
    }
  }, [note])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    onUpdateNote({ title: newTitle })
    setAutoSaveStatus("saving")
    const timer = setTimeout(() => setAutoSaveStatus("saved"), 1000)
    return () => clearTimeout(timer)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    onUpdateNote({ content: newContent })
    setAutoSaveStatus("saving")
    const timer = setTimeout(() => setAutoSaveStatus("saved"), 1000)
    return () => clearTimeout(timer)
  }

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <FileText className="w-14 h-14 text-foreground/20 mb-6" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Note Selected</h2>
        <p className="text-sm text-foreground/50 mb-8">Create a new note to get started</p>
        <button
          onClick={onCreateNote}
          className="px-6 py-2.5 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground transition-all duration-200 rounded-md font-medium text-sm"
        >
          Create New Note
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-screen">
      <div className="border-b border-border px-8 py-5 flex items-center justify-between backdrop-blur-sm bg-background/50">
        <div className="flex-1">
          <input
            ref={titleInputRef}
            type="text"
            placeholder="Untitled"
            defaultValue={note.title}
            onChange={handleTitleChange}
            className="text-3xl font-semibold text-foreground bg-transparent outline-none placeholder-foreground/30 w-full"
          />
        </div>
        <div
          className={`text-xs font-medium ml-6 px-3 py-1.5 rounded-full transition-all duration-200 ${
            autoSaveStatus === "saved" ? "text-foreground/60 bg-foreground/5" : "text-foreground/70 bg-foreground/10"
          }`}
        >
          {autoSaveStatus === "saved" ? "Saved" : "Saving..."}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-8">
        <textarea
          ref={contentTextareaRef}
          placeholder="Start typing... your note will auto-save"
          defaultValue={note.content}
          onChange={handleContentChange}
          className="w-full h-full text-base text-foreground bg-transparent outline-none placeholder-foreground/30 resize-none leading-relaxed font-light"
        />
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"
import AIToolbar from "./ai-toolbar"

interface Note {
  id: string
  title: string
  desc: string
  createdAt: string
  updatedAt: string
}

interface EditorProps {
  note: Note | undefined
  onUpdateNote: (updates: Partial<Note>) => void
  onCreateNote: () => void
}

export default function Editor({ note, onUpdateNote, onCreateNote }: EditorProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [contentValue, setContentValue] = useState(note?.desc || "")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving">("saved")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setContentValue(note?.desc || "")
    if (titleInputRef.current) {
      titleInputRef.current.value = note?.title || ""
    }
  }, [note?.id])

  const saveToBackend = async (title: string, content: string) => {
    if (!note?.id) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/notes/note/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title, 
          desc: content
        }),
      })
      
      if (res.ok) {
        setAutoSaveStatus("saved")
      } else {
        console.error('Save failed:', await res.text())
      }
    } catch (e) {
      console.error('Save failed:', e)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    onUpdateNote({ title: newTitle })
    setAutoSaveStatus("saving")
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      saveToBackend(newTitle, contentValue)
    }, 1000)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContentValue(newContent)
    onUpdateNote({ desc: newContent })
    setAutoSaveStatus("saving")
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      saveToBackend(titleInputRef.current?.value || "", newContent)
    }, 1000)
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

      <AIToolbar
        content={contentValue}
        onContentUpdate={(updates: any) => {
          const newContent = updates.content || updates.desc
          if (newContent) {
            setContentValue(newContent)
            onUpdateNote({ desc: newContent })
          }
        }}
      />

      <div className="flex-1 overflow-auto px-8 py-8">
        <textarea
          placeholder="Start typing... your note will auto-save"
          value={contentValue} 
          onChange={handleContentChange}
          className="w-full h-full text-base text-foreground bg-transparent outline-none placeholder-foreground/30 resize-none leading-relaxed font-light"
        />
      </div>
    </div>
  )
}
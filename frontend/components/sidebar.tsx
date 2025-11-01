"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

interface SidebarProps {
  notes: Note[]
  currentNoteId: string | null
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
}

export default function Sidebar({ notes, currentNoteId, onSelectNote, onCreateNote, onDeleteNote }: SidebarProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-sidebar-foreground mb-4 tracking-tight">Notes</h1>
        <Button
          onClick={onCreateNote}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground transition-all duration-200 rounded-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-sidebar-foreground/50">No notes yet</p>
            <p className="text-xs text-sidebar-foreground/40 mt-2">Create one to get started</p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`group rounded-md cursor-pointer transition-all duration-200 ${
                  currentNoteId === note.id
                    ? "bg-sidebar-primary/15 text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-secondary/50"
                }`}
                onClick={() => onSelectNote(note.id)}
              >
                <div className="flex items-start justify-between gap-3 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-sidebar-foreground">{note.title || "Untitled"}</p>
                    <p className="text-xs text-sidebar-foreground/50 mt-1 truncate line-clamp-1">
                      {note.content.substring(0, 40) || "Empty note"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/40 mt-1.5">{formatDate(note.updatedAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteNote(note.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 p-1.5 hover:text-destructive rounded hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

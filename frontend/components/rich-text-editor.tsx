"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Bold, Italic, Underline, List, ListOrdered, Code2, Image, Quote, Share2, Download, Trash2 } from "lucide-react"
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

export default function RichTextEditor({ note, onUpdateNote, onCreateNote }: EditorProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [contentValue, setContentValue] = useState(note?.desc || "")
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving">("saved")
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setContentValue(note?.desc || "")
    if (titleInputRef.current) {
      titleInputRef.current.value = note?.title || ""
    }
    if (editorRef.current) {
      editorRef.current.innerHTML = note?.desc || ""
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

  const handleEditorInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContentValue(newContent)
      onUpdateNote({ desc: newContent })
      setAutoSaveStatus("saving")
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        saveToBackend(titleInputRef.current?.value || "", newContent)
      }, 1000)
    }
  }

  const toggleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleEditorInput()
  }

  const insertBulletList = () => {
    document.execCommand('insertUnorderedList', false)
    editorRef.current?.focus()
    handleEditorInput()
  }

  const insertNumberedList = () => {
    document.execCommand('insertOrderedList', false)
    editorRef.current?.focus()
    handleEditorInput()
  }

  const insertCodeBlock = () => {
    const pre = document.createElement('pre')
    pre.style.backgroundColor = 'rgba(0,0,0,0.2)'
    pre.style.padding = '12px'
    pre.style.borderRadius = '6px'
    pre.style.overflow = 'auto'
    pre.style.margin = '12px 0'
    pre.style.fontFamily = 'monospace'
    pre.style.fontSize = '14px'
    pre.textContent = 'code here'
    
    if (editorRef.current) {
      editorRef.current.appendChild(pre)
      editorRef.current.focus()
      handleEditorInput()
    }
  }

  const insertQuote = () => {
    const blockquote = document.createElement('blockquote')
    blockquote.style.borderLeft = '4px solid #3b82f6'
    blockquote.style.paddingLeft = '16px'
    blockquote.style.marginLeft = '0'
    blockquote.style.marginRight = '0'
    blockquote.style.color = 'rgba(255,255,255,0.7)'
    blockquote.style.fontStyle = 'italic'
    blockquote.style.margin = '12px 0'
    blockquote.textContent = 'Quote text here'
    
    if (editorRef.current) {
      editorRef.current.appendChild(blockquote)
      editorRef.current.focus()
      handleEditorInput()
    }
  }

  const insertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && editorRef.current) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const img = document.createElement('img')
          img.src = event.target?.result as string
          img.style.maxWidth = '100%'
          img.style.height = 'auto'
          img.style.margin = '12px 0'
          img.style.borderRadius = '8px'
          img.style.maxHeight = '500px'
          
          editorRef.current?.appendChild(img)
          editorRef.current?.focus()
          handleEditorInput()
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const clearContent = () => {
    if (confirm('Are you sure you want to clear all content?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
        handleEditorInput()
      }
    }
  }

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <FileText className="w-16 h-16 text-foreground/20 mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">No Note Selected</h2>
        <p className="text-base text-foreground/50 mb-8">Create a new note to start editing</p>
        <button
          onClick={onCreateNote}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg font-semibold"
        >
          + Create New Note
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-screen overflow-hidden relative">
      {/* Header */}
      <div className="border-b border-border/30 px-8 py-6 backdrop-blur-sm bg-background/40">
        <div className="flex items-center justify-between mb-4">
          <input
            ref={titleInputRef}
            type="text"
            placeholder="Untitled Note"
            defaultValue={note.title}
            onChange={handleTitleChange}
            className="text-4xl font-bold text-foreground bg-transparent outline-none placeholder-foreground/30 w-full"
          />
          <div className="flex items-center gap-4 ml-6">
            <div
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all duration-300 whitespace-nowrap ${
                autoSaveStatus === "saved" 
                  ? "text-emerald-400 bg-emerald-500/10" 
                  : "text-amber-400 bg-amber-500/10"
              }`}
            >
              {autoSaveStatus === "saved" ? "✓ Saved" : "⟳ Saving..."}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar - Modern Design */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-foreground/[0.02] to-background px-8 py-4 flex items-center justify-between gap-8 backdrop-blur-sm">
        {/* Left: Formatting Tools */}
        <div className="flex items-center gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm rounded-lg p-1.5 border border-foreground/10">
            <button
              onClick={() => toggleFormat('bold')}
              className="p-2 hover:bg-foreground/20 hover:text-primary rounded transition-all duration-200 text-foreground"
              title="Bold"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => toggleFormat('italic')}
              className="p-2 hover:bg-foreground/20 hover:text-primary rounded transition-all duration-200 text-foreground"
              title="Italic"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => toggleFormat('underline')}
              className="p-2 hover:bg-foreground/20 hover:text-primary rounded transition-all duration-200 text-foreground"
              title="Underline"
            >
              <Underline size={18} />
            </button>
          </div>

          {/* Lists & Code */}
          <div className="flex items-center gap-1 bg-foreground/5 backdrop-blur-sm rounded-lg p-1.5 border border-foreground/10">
            <button
              onClick={insertBulletList}
              className="p-2 hover:bg-foreground/20 hover:text-primary rounded transition-all duration-200 text-foreground"
              title="Bullet List"
            >
              <List size={18} />
            </button>
            <button
              onClick={insertNumberedList}
              className="p-2 hover:bg-foreground/20 hover:text-primary rounded transition-all duration-200 text-foreground"
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </button>
            <button
              onClick={insertCodeBlock}
              className="p-2 hover:bg-foreground/20 hover:text-primary rounded transition-all duration-200 text-foreground"
              title="Code Block"
            >
              <Code2 size={18} />
            </button>
            <button
              onClick={insertQuote}
              className="p-2 hover:bg-foreground/20 hover:text-primary rounded transition-all duration-200 text-foreground"
              title="Quote"
            >
              <Quote size={18} />
            </button>
            <button
              onClick={insertImage}
              className="p-2 hover:bg-foreground/20 hover:text-primary rounded transition-all duration-200 text-foreground"
              title="Insert Image"
            >
              <Image size={18} />
            </button>
          </div>
        </div>

        {/* Middle: Empty space */}
        <div className="flex-1" />

        {/* Right: AI Features */}
        <AIToolbar
          content={contentValue}
          onContentUpdate={(updates: any) => {
            const newContent = updates.content || updates.desc
            if (newContent) {
              setContentValue(newContent)
              if (editorRef.current) {
                editorRef.current.innerHTML = newContent
              }
              onUpdateNote({ desc: newContent })
            }
          }}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-8 py-8 bg-background">
        <div className="w-full max-w-4xl mx-auto">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            suppressContentEditableWarning
            className="w-full text-lg text-foreground/90 bg-transparent outline-none leading-relaxed focus:outline-none"
            style={{
              minHeight: '600px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          />
        </div>
      </div>
    </div>
  )
}
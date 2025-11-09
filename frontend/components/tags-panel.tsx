'use client'
import { useState } from 'react'
import { Tag, Plus, Trash2, ChevronDown, ChevronRight, Check } from 'lucide-react'

interface TagItem {
  id: string
  name: string
  notes?: any[]
}

interface TagsPanelProps {
  tags: TagItem[]
  onRefresh: () => void
  currentNoteId?: string | null
  token: string | null
}

export default function TagsPanel({ tags, onRefresh, currentNoteId, token }: TagsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const createTag = async () => {
    if (!newTagName.trim()) return

    try {
      const res = await fetch('http://localhost:3001/api/features/tags/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTagName }),
      })

      if (res.ok) {
        setNewTagName('')
        setIsCreating(false)
        onRefresh()
      }
    } catch (e) {
      console.error('Error creating tag:', e)
    }
  }

  const toggleTag = async (tagId: string) => {
    if (!currentNoteId) return

    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId]

    setSelectedTags(newSelectedTags)

    try {
      await fetch(`http://localhost:3001/api/features/notes/${currentNoteId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tagIds: newSelectedTags }),
      })
      onRefresh()
    } catch (e) {
      console.error('Error updating tags:', e)
    }
  }

  return (
    <div className='p-3 border-b border-border/40'>
      {/* Header */}
      <div className='flex items-center gap-2 w-full px-2 py-2 hover:bg-foreground/10 rounded transition-colors'>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='p-0 hover:bg-foreground/10 rounded'
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <Tag size={16} />
        <span className='text-sm font-semibold flex-1'>Tags</span>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className='p-1 hover:bg-primary/20 rounded transition-colors'
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Create New Tag */}
      {isCreating && (
        <div className='p-2 mt-2 bg-foreground/5 rounded space-y-2'>
          <input
            type='text'
            placeholder='Tag name...'
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className='w-full px-2 py-1 text-sm rounded bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
            autoFocus
          />
          <div className='flex gap-2'>
            <button
              onClick={createTag}
              className='flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors'
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewTagName('')
              }}
              className='flex-1 px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tags List */}
      {isExpanded && (
        <div className='mt-2 space-y-1 max-h-32 overflow-y-auto'>
          {tags.length === 0 ? (
            <p className='text-xs text-foreground/50 px-2 py-1'>No tags yet</p>
          ) : (
            tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className='w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-foreground/10 group transition-colors text-sm text-left'
              >
                <div
                  className={`w-4 h-4 rounded border ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary border-primary flex items-center justify-center'
                      : 'border-border'
                  }`}
                >
                  {selectedTags.includes(tag.id) && <Check size={12} className='text-primary-foreground' />}
                </div>
                <span className='flex-1 truncate'>{tag.name}</span>
                <span className='text-xs text-foreground/50'>({tag.notes?.length || 0})</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
'use client'
import { useState } from 'react'
import { FolderOpen, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

interface Folder {
  id: string
  name: string
  notes?: any[]
}

interface FoldersPanelProps {
  folders: Folder[]
  onRefresh: () => void
  currentNoteId?: string | null
  token: string | null
}

export default function FoldersPanel({ folders, onRefresh, currentNoteId, token }: FoldersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const res = await fetch('http://localhost:3001/api/features/folders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newFolderName }),
      })

      if (res.ok) {
        setNewFolderName('')
        setIsCreating(false)
        onRefresh()
      }
    } catch (e) {
      console.error('Error creating folder:', e)
    }
  }

  const deleteFolder = async (folderId: string) => {
    try {
      await fetch(`http://localhost:3001/api/features/folders/${folderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      onRefresh()
    } catch (e) {
      console.error('Error deleting folder:', e)
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
        <FolderOpen size={16} />
        <span className='text-sm font-semibold flex-1'>Folders</span>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className='p-1 hover:bg-primary/20 rounded transition-colors'
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Create New Folder */}
      {isCreating && (
        <div className='p-2 mt-2 bg-foreground/5 rounded space-y-2'>
          <input
            type='text'
            placeholder='Folder name...'
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className='w-full px-2 py-1 text-sm rounded bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
            autoFocus
          />
          <div className='flex gap-2'>
            <button
              onClick={createFolder}
              className='flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors'
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewFolderName('')
              }}
              className='flex-1 px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20 transition-colors'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Folders List */}
      {isExpanded && (
        <div className='mt-2 space-y-1 max-h-32 overflow-y-auto'>
          {folders.length === 0 ? (
            <p className='text-xs text-foreground/50 px-2 py-1'>No folders yet</p>
          ) : (
            folders.map((folder) => (
              <div
                key={folder.id}
                className='flex items-center gap-2 px-2 py-1 rounded hover:bg-foreground/10 group transition-colors text-sm'
              >
                <FolderOpen size={14} className='text-primary' />
                <span className='flex-1 truncate'>{folder.name}</span>
                <span className='text-xs text-foreground/50'>({folder.notes?.length || 0})</span>
                <button
                  onClick={() => deleteFolder(folder.id)}
                  className='p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all'
                >
                  <Trash2 size={12} className='text-red-500' />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
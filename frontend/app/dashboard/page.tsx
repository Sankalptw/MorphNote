'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import RichTextEditor from '@/components/rich-text-editor'
import ProfileMenu from '@/components/profile-menu'
import SearchBar from '@/components/search-bar'
import ShareModal from '@/components/share-modal'
import { Share2, Download, FolderPlus, Plus, Trash2, ChevronDown, ChevronRight, File } from 'lucide-react'

const API_URL = 'http://localhost:3001'

interface Note {
  id: string
  title: string
  desc: string
  folderId?: string | null
  createdAt: string
  updatedAt: string
}

interface Folder {
  id: string
  name: string
  notes?: Note[]
}

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [folders, setFolders] = useState<Folder[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'all' | 'folder'>('all')
  const [searchResults, setSearchResults] = useState<Note[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { token } = useAuth()
  const router = useRouter()

  const currentNote = notes.find((note) => note.id === currentNoteId)

  useEffect(() => {
    if (!token) {
      router.push('/')
      return
    }
    fetchNotes()
    fetchFolders()
  }, [token, router])

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes/my-notes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch (e) {
      console.error('Error fetching notes:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/features/folders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFolders(data.folders || [])
      } else {
        setFolders([])
      }
    } catch (e) {
      console.error('Error fetching folders:', e)
      setFolders([])
    }
  }

  const handleSearch = async (query: string) => {
    if (!query || query.trim() === '') {
      setIsSearching(false)
      setSearchResults([])
      setViewMode('all')
      return
    }

    try {
      const res = await fetch(
        `${API_URL}/api/features/notes/search?q=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.ok) {
        const data = await res.json()
        setSearchResults(data.notes || [])
        setIsSearching(true)
        if (data.notes && data.notes.length > 0) {
          setCurrentNoteId(data.notes[0].id)
        }
      }
    } catch (e) {
      console.error('Search error:', e)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) {
    return
  }

  try {
    console.log('FOLDER CREATE: Starting')
    const res = await fetch(`${API_URL}/api/features/folders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newFolderName }),
    })

    console.log('FOLDER CREATE: Response', res.status)

    if (res.ok) {
      setNewFolderName('')
      setShowFolderInput(false)
      fetchFolders()
    } else {
      const err = await res.json().catch(() => ({}))
      alert(`Error: ${err.message || 'Failed to create'}`)
    }
  } catch (e) {
    console.error('Folder error:', e)
    alert('Error creating folder')
  }
}


  const deleteFolder = async (folderId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/features/folders/${folderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchFolders()
        fetchNotes()
        if (selectedFolderId === folderId) {
          setSelectedFolderId(null)
          setViewMode('all')
        }
      }
    } catch (e) {
      console.error('Error deleting folder:', e)
    }
  }

  const createNewNote = async (folderId?: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notes/newnote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'Untitled', desc: '' }),
      })
      if (res.ok) {
        const data = await res.json()
        let newNote = data.note

        if (folderId) {
          const updateRes = await fetch(
            `${API_URL}/api/notes/notes/${newNote.id}/folder`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ folderId }),
            }
          )
          if (updateRes.ok) {
            newNote = { ...newNote, folderId }
          }
        }

        setNotes([newNote, ...notes])
        setCurrentNoteId(newNote.id)
      }
    } catch (e) {
      console.error('Error creating note:', e)
    }
  }

  const updateNote = async (updates: Partial<Note>) => {
    if (!currentNoteId) return

    setNotes(
      notes.map((note) =>
        note.id === currentNoteId ? { ...note, ...updates } : note
      )
    )

    try {
      await fetch(`${API_URL}/api/notes/note/${currentNoteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: updates.title || currentNote?.title || 'Untitled',
          desc: updates.desc || currentNote?.desc || '',
        }),
      })
    } catch (e) {
      console.error('Error updating note:', e)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notes/note/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const updatedNotes = notes.filter((note) => note.id !== id)
        setNotes(updatedNotes)
        if (currentNoteId === id) {
          setCurrentNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null)
        }
      }
    } catch (e) {
      console.error('Error deleting note:', e)
    }
  }

  const exportNote = async () => {
    if (!currentNote) return

    try {
      const response = await fetch(
        `${API_URL}/api/notes/note/${currentNote.id}/export`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!response.ok) return

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentNote.title || 'note'}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Error exporting note:', e)
    }
  }

  const toggleFolderExpand = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getDisplayNotes = () => {
    if (viewMode === 'all') {
      return notes.filter(n => !n.folderId)
    }
    return notes.filter(n => n.folderId === selectedFolderId)
  }

  const displayNotes = isSearching ? searchResults : getDisplayNotes()
  const ungroupedNotesCount = notes.filter(n => !n.folderId).length

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen bg-background'>
        <div className='text-foreground'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-screen overflow-hidden bg-background'>
      <header className='border-b border-border p-4 flex items-center justify-between bg-foreground/2'>
        <h1 className='text-2xl font-bold text-foreground'>MorphNote</h1>
        <div className='flex items-center gap-3'>
          <SearchBar onSearch={handleSearch} />
          <ProfileMenu />
        </div>
      </header>

      <div className='flex flex-1 overflow-hidden'>
        <div className='w-80 border-r border-border flex flex-col bg-foreground/2'>
          <div className='p-4 border-b border-border space-y-2'>
            <button
              onClick={() => createNewNote()}
              className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium'
            >
              <Plus size={18} />
              New Note
            </button>
          </div>

          {!isSearching && (
            <div className='p-4 border-b border-border'>
              <h3 className='text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3'>
                Files
              </h3>
              {ungroupedNotesCount === 0 ? (
                <p className='text-xs text-foreground/40'>No files yet</p>
              ) : (
                <div className='space-y-1'>
                  {notes
                    .filter(n => !n.folderId)
                    .map(note => (
                      <button
                        key={note.id}
                        onClick={() => {
                          setCurrentNoteId(note.id)
                          setViewMode('all')
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 truncate text-sm ${
                          currentNoteId === note.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-foreground/10'
                        }`}
                      >
                        <File size={14} />
                        <span className='truncate'>{note.title}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {isSearching && (
            <div className='p-4 border-b border-border flex-1 overflow-y-auto'>
              <h3 className='text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3'>
                Search Results
              </h3>
              {searchResults.length === 0 ? (
                <p className='text-xs text-foreground/40'>No results found</p>
              ) : (
                <div className='space-y-1'>
                  {searchResults.map(note => (
                    <button
                      key={note.id}
                      onClick={() => setCurrentNoteId(note.id)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2 truncate text-sm ${
                        currentNoteId === note.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-foreground/10'
                      }`}
                    >
                      <File size={14} />
                      <span className='truncate'>{note.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isSearching && (
            <div className='p-4 flex-1 overflow-y-auto'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-xs font-semibold text-foreground/60 uppercase tracking-wider'>
                  Folders
                </h3>
                <button
                  onClick={() => setShowFolderInput(true)}
                  className='p-1.5 hover:bg-foreground/10 rounded transition-colors'
                  title='New Folder'
                >
                  <FolderPlus size={16} className='text-primary' />
                </button>
              </div>

              {showFolderInput && (
                <div className='space-y-2 p-3 bg-background rounded border border-border mb-3'>
                  <input
                    type='text'
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') createFolder()
                    }}
                    placeholder='Folder name...'
                    className='w-full px-3 py-2 text-sm rounded bg-foreground/5 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                    autoFocus
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={createFolder}
                      className='flex-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90'
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowFolderInput(false)}
                      className='flex-1 px-2 py-1 text-xs bg-foreground/10 rounded hover:bg-foreground/20'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className='space-y-1'>
                {folders.length === 0 ? (
                  <p className='text-xs text-foreground/40'>No folders yet</p>
                ) : (
                  folders.map((folder) => (
                    <div key={folder.id} className='space-y-1'>
                      <div className='flex items-center gap-1 group'>
                        <button
                          onClick={() => toggleFolderExpand(folder.id)}
                          className='p-1 hover:bg-foreground/10 rounded'
                        >
                          {expandedFolders.has(folder.id) ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setViewMode('folder')
                            setSelectedFolderId(folder.id)
                          }}
                          className={`flex-1 text-left px-2 py-2 rounded text-sm transition-colors truncate ${
                            selectedFolderId === folder.id && viewMode === 'folder'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-foreground/10'
                          }`}
                        >
                          📁 {folder.name}
                        </button>
                        <button
                          onClick={() => deleteFolder(folder.id)}
                          className='p-1 text-foreground/30 hover:text-red-500 hover:bg-foreground/10 rounded opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {expandedFolders.has(folder.id) && (
                        <div className='ml-6 space-y-1'>
                          {notes
                            .filter(n => n.folderId === folder.id)
                            .map(note => (
                              <button
                                key={note.id}
                                onClick={() => {
                                  setCurrentNoteId(note.id)
                                  setViewMode('folder')
                                  setSelectedFolderId(folder.id)
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 truncate ${
                                  currentNoteId === note.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground/70 hover:text-foreground hover:bg-foreground/10'
                                }`}
                              >
                                <File size={12} />
                                <span className='truncate'>{note.title}</span>
                              </button>
                            ))}
                          <button
                            onClick={() => createNewNote(folder.id)}
                            className='w-full text-left px-3 py-1.5 rounded text-xs text-primary hover:bg-foreground/10 flex items-center gap-2 transition-colors'
                          >
                            <Plus size={12} /> New File
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className='flex-1 flex flex-col overflow-hidden'>
          {currentNote ? (
            <>
              <div className='border-b border-border p-4 flex items-center justify-between bg-foreground/2'>
                <div>
                  <h2 className='text-sm text-foreground/60'>Editing</h2>
                  <p className='text-lg font-semibold text-foreground'>{currentNote.title}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-foreground/10 transition-colors text-sm text-foreground'
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    onClick={exportNote}
                    className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-foreground/10 transition-colors text-sm text-foreground'
                  >
                    <Download size={16} />
                    Export
                  </button>
                  <button
                    onClick={() => deleteNote(currentNote.id)}
                    className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm text-foreground'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className='flex-1 overflow-hidden'>
                <RichTextEditor
                  note={currentNote}
                  onUpdateNote={updateNote}
                  onCreateNote={createNewNote}
                />
              </div>
            </>
          ) : (
            <div className='flex items-center justify-center h-full text-foreground/50'>
              <div className='text-center'>
                <File size={48} className='mx-auto mb-4 opacity-50' />
                <p className='text-lg'>Select or create a note to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showShareModal && currentNote && (
        <ShareModal
          noteId={currentNote.id}
          onClose={() => setShowShareModal(false)}
          token={token}
        />
      )}
    </div>
  )
}
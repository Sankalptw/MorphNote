// frontend/services/api.ts
// This service calls BOTH microservices (auth/notes) AND your old backend (AI features)

const MICROSERVICES_URL = 'http://localhost:5000'  // New microservices (auth, notes)
const OLD_BACKEND_URL = 'http://localhost:3001'    // Your existing backend (AI features)

// ==================== AUTH APIs (Microservices) ====================

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${MICROSERVICES_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!response.ok) throw new Error('Login failed')
    return response.json()
  },

  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${MICROSERVICES_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!response.ok) throw new Error('Registration failed')
    return response.json()
  },
}

// ==================== NOTES APIs (Microservices) ====================

export const notesAPI = {
  createNote: async (title: string, content: string, token: string, userId: string) => {
    const response = await fetch(`${MICROSERVICES_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-User-ID': userId,
      },
      body: JSON.stringify({ title, content }),
    })
    if (!response.ok) throw new Error('Failed to create note')
    return response.json()
  },

  getAllNotes: async (token: string, userId: string) => {
    const response = await fetch(`${MICROSERVICES_URL}/api/notes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-User-ID': userId,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch notes')
    return response.json()
  },

  getNoteById: async (noteId: string, token: string, userId: string) => {
    const response = await fetch(`${MICROSERVICES_URL}/api/notes/${noteId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-User-ID': userId,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch note')
    return response.json()
  },

  updateNote: async (noteId: string, title: string, content: string, token: string, userId: string) => {
    const response = await fetch(`${MICROSERVICES_URL}/api/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-User-ID': userId,
      },
      body: JSON.stringify({ title, content }),
    })
    if (!response.ok) throw new Error('Failed to update note')
    return response.json()
  },

  deleteNote: async (noteId: string, token: string, userId: string) => {
    const response = await fetch(`${MICROSERVICES_URL}/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-User-ID': userId,
      },
    })
    if (!response.ok) throw new Error('Failed to delete note')
    return response.json()
  },
}

// ==================== AI APIs (Old Backend - Keep as is) ====================

export const aiAPI = {
  stylize: async (text: string, tone: string, length: string, creativity: string, token: string) => {
    const response = await fetch(`${OLD_BACKEND_URL}/api/stylize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, tone, length, creativity }),
    })
    if (!response.ok) throw new Error('Failed to stylize')
    return response.json()
  },

  summarize: async (text: string, length: string, token: string) => {
    const response = await fetch(`${OLD_BACKEND_URL}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, length }),
    })
    if (!response.ok) throw new Error('Failed to summarize')
    return response.json()
  },

  extractKeypoints: async (text: string, token: string) => {
    const response = await fetch(`${OLD_BACKEND_URL}/api/extract-keypoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) throw new Error('Failed to extract keypoints')
    return response.json()
  },
}

// ==================== RAG APIs (Old Backend - Keep as is) ====================

export const ragAPI = {
  uploadPDF: async (file: File, token: string) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${OLD_BACKEND_URL}/api/rag/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    if (!response.ok) throw new Error('Failed to upload PDF')
    return response.json()
  },

  queryPDF: async (query: string, token: string) => {
    const response = await fetch(`${OLD_BACKEND_URL}/api/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    })
    if (!response.ok) throw new Error('Failed to query PDF')
    return response.json()
  },
}

// ==================== EXPORT ====================

export default {
  auth: authAPI,
  notes: notesAPI,
  ai: aiAPI,
  rag: ragAPI,
}
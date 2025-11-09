'use client'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <div className='relative w-64'>
      <div className='relative flex items-center'>
        <Search size={18} className='absolute left-3 text-foreground/50' />
        <input
          type='text'
          placeholder='Search notes...'
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className='w-full pl-10 pr-8 py-2 rounded-lg bg-foreground/5 border border-border text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary'
        />
        {query && (
          <button
            onClick={handleClear}
            className='absolute right-2 p-1 hover:bg-foreground/10 rounded transition-colors'
          >
            <X size={16} className='text-foreground/50' />
          </button>
        )}
      </div>
    </div>
  )
}
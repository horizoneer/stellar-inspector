import { useState, useEffect } from 'react'

const BOOKMARKS_KEY = 'stellar-inspector-bookmarks'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY)
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse bookmarks:', e)
      }
    }
  }, [])

  const addBookmark = (item) => {
    const newBookmark = {
      id: Date.now(),
      type: item.type || 'transaction',
      value: item.value,
      label: item.label || item.value.slice(0, 12),
      timestamp: new Date().toISOString(),
    }
    
    const updated = [...bookmarks, newBookmark]
    setBookmarks(updated)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
    return newBookmark
  }

  const removeBookmark = (id) => {
    const updated = bookmarks.filter(b => b.id !== id)
    setBookmarks(updated)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
  }

  const isBookmarked = (value) => {
    return bookmarks.some(b => b.value === value)
  }

  const clearBookmarks = () => {
    setBookmarks([])
    localStorage.removeItem(BOOKMARKS_KEY)
  }

  return {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    clearBookmarks,
  }
}

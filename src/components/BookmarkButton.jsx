import React from 'react'
import { Star, StarOff } from 'lucide-react'
import styles from './BookmarkButton.module.css'

export default function BookmarkButton({ value, type, label, isBookmarked, onToggle }) {
  return (
    <button
      className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarked : ''}`}
      onClick={() => onToggle(value, type, label)}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {isBookmarked ? <StarOff size={14} fill="currentColor" /> : <Star size={14} />}
    </button>
  )
}

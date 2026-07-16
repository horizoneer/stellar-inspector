import React, { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import styles from './KeyboardShortcuts.module.css'

const SHORTCUTS = [
  { key: '/', description: 'Focus search input' },
  { key: 'Escape', description: 'Clear input and blur focus' },
  { key: 'Ctrl + C', description: 'Copy transaction hash' },
  { key: 'N + T', description: 'Toggle network (Mainnet/Testnet)' },
]

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === '?' && !isOpen) {
        setIsOpen(true)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Keyboard size={20} />
            <span>Keyboard Shortcuts</span>
          </div>
          <button 
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.shortcutList}>
            {SHORTCUTS.map((shortcut, index) => (
              <div key={index} className={styles.shortcutItem}>
                <kbd className={styles.key}>{shortcut.key}</kbd>
                <span className={styles.description}>{shortcut.description}</span>
              </div>
            ))}
          </div>
          <div className={styles.footer}>
            <p className={styles.hint}>
              Press <kbd className={styles.key}>?</kbd> or <kbd className={styles.key}>Ctrl + K</kbd> to toggle this panel
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

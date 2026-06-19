import React from 'react'
import { Copy, Check } from 'lucide-react'
import { useClipboard } from '../hooks/useClipboard'
import styles from './CopyButton.module.css'

export default function CopyButton({ value, label, size = 14 }) {
  const { copy, copied } = useClipboard()
  const key = label || value

  return (
    <button
      className={`${styles.btn} ${copied === key ? styles.copied : ''}`}
      onClick={() => copy(value, key)}
      aria-label={`Copy ${label || 'value'}`}
      title={copied === key ? 'Copied!' : 'Copy'}
    >
      {copied === key
        ? <Check size={size} strokeWidth={2} />
        : <Copy size={size} strokeWidth={1.5} />
      }
    </button>
  )
}

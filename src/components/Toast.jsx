import React, { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import styles from './Toast.module.css'

export default function Toast({ message, visible }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 1800)
      return () => clearTimeout(t)
    }
  }, [visible])

  return (
    <div className={`${styles.toast} ${show ? styles.show : ''}`} role="status" aria-live="polite">
      <Check size={14} strokeWidth={2} />
      {message || 'Copied!'}
    </div>
  )
}

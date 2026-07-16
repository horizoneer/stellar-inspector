import React, { useEffect, useState } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'
import styles from './Toast.module.css'

export default function Toast({ message, visible, type = 'success', duration = 3000 }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const t = setTimeout(() => setShow(false), duration)
      return () => clearTimeout(t)
    }
  }, [visible, duration])

  const icons = {
    success: <Check size={16} strokeWidth={2} />,
    error: <X size={16} strokeWidth={2} />,
    warning: <AlertCircle size={16} strokeWidth={2} />,
    info: <Info size={16} strokeWidth={2} />,
  }

  return (
    <div 
      className={`${styles.toast} ${styles[type]} ${show ? styles.show : ''}`} 
      role="status" 
      aria-live="polite"
    >
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message || 'Copied!'}</span>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({ message, type, duration })
  }

  const hideToast = () => {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}

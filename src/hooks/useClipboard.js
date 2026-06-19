import { useState, useCallback } from 'react'

export function useClipboard(timeout = 1800) {
  const [copied, setCopied] = useState(null)

  const copy = useCallback((text, key = 'default') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), timeout)
    })
  }, [timeout])

  return { copy, copied }
}

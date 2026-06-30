import { useEffect, useCallback } from 'react'

export function useKeyboard(handlers) {
  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key.toLowerCase()
      const ctrlOrCmd = e.ctrlKey || e.metaKey

      if (handlers[key] && !e.target.matches('input, textarea')) {
        e.preventDefault()
        handlers[key]()
      } else if (ctrlOrCmd && key === 'c' && handlers['ctrl+c']) {
        e.preventDefault()
        handlers['ctrl+c']()
      } else if (key === 'n' || key === 't') {
        if (!e.target.matches('input, textarea')) {
          e.preventDefault()
          if (handlers['n/t']) handlers['n/t']()
        }
      }
    },
    [handlers]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

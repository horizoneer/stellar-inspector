import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'stellar-inspector-history'
const MAX_HISTORY = 10

export function useTransactionHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  }, [history])

  const addToHistory = useCallback((tx) => {
    if (!tx.hash) return
    
    setHistory(prev => {
      const filtered = prev.filter(item => item.hash !== tx.hash)
      const newItem = {
        hash: tx.hash,
        createdAt: new Date().toISOString(),
        sourceAccount: tx.source_account,
        operationCount: tx.operation_count,
        successful: tx.successful
      }
      return [newItem, ...filtered].slice(0, MAX_HISTORY)
    })
  }, [])

  const removeFromHistory = useCallback((hash) => {
    setHistory(prev => prev.filter(item => item.hash !== hash))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  }
}

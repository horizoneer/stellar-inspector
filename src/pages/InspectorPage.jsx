import React, { useState, useEffect } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { fetchTransaction, setHorizonUrl } from '../utils/stellar'
import { useNetwork } from '../context/NetworkContext'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import TransactionView from '../components/TransactionView'
import NetworkStatus from '../components/NetworkStatus'
import TransactionHistory from '../components/TransactionHistory'
import styles from './InspectorPage.module.css'

export default function InspectorPage() {
  const [input, setInput] = useState('')
  const [tx, setTx] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { config, network } = useNetwork()
  const { history, addToHistory, removeFromHistory, clearHistory } = useTransactionHistory()

  useEffect(() => {
    setHorizonUrl(config.horizonUrl)
  }, [config.horizonUrl])

  async function handleInspect(value) {
    const query = (value || input).trim()
    if (!query) return
    setLoading(true)
    setError(null)
    setTx(null)
    try {
      const result = await fetchTransaction(query)
      setTx(result)
      if (!result.xdr_only) {
        addToHistory(result)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleHistorySelect(hash) {
    setInput(hash)
    handleInspect(hash)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleInspect()
  }

  async function loadExample() {
  setLoading(true)
  setError(null)
  setTx(null)
  try {
    const res = await fetch(`${config.horizonUrl}/transactions?limit=1&order=desc`)
    const data = await res.json()
    const hash = data._embedded.records[0].hash
    setInput(hash)
    const result = await fetchTransaction(hash)
    setTx(result)
    addToHistory(result)
  } catch (err) {
    setError('Could not load example transaction.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Transaction Inspector</h1>
        <p className={styles.subtitle}>
          Paste a Stellar transaction hash or XDR string to decode it into plain English.
        </p>
      </div>

      <NetworkStatus />

      <TransactionHistory
        history={history}
        onSelect={handleHistorySelect}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />

      <div className={styles.searchRow}>
        <div className={styles.inputWrap}>
          <Search size={15} strokeWidth={1.5} className={styles.searchIcon} />
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Transaction hash or XDR…"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <button className={styles.btnPrimary} onClick={() => handleInspect()} disabled={loading}>
          {loading ? <Loader2 size={15} className={styles.spin} /> : 'Inspect'}
        </button>
        <button className={styles.btnSecondary} onClick={loadExample} disabled={loading}>
          Example
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={15} strokeWidth={1.5} />
          {error}
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <Loader2 size={20} className={styles.spin} />
          <span>Fetching from Horizon…</span>
        </div>
      )}

      {tx && <TransactionView tx={tx} />}

      {!tx && !loading && !error && (
        <div className={styles.empty}>
          <p>Enter a transaction hash above to get started, or try the <button className={styles.link} onClick={loadExample}>example transaction</button>.</p>
        </div>
      )}
    </div>
  )
}

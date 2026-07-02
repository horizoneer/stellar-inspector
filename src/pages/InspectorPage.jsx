import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2, AlertCircle, X, GitCompare, Eye } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchTransaction, setHorizonUrl, simulateTransaction } from '../utils/stellar'
import { useNetwork } from '../context/NetworkContext'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import { useKeyboard } from '../hooks/useKeyboard'
import TransactionView from '../components/TransactionView'
import NetworkStatus from '../components/NetworkStatus'
import TransactionHistory from '../components/TransactionHistory'
import TransactionDiff from '../components/TransactionDiff'
import TransactionSearch from '../components/TransactionSearch'
import styles from './InspectorPage.module.css'

export default function InspectorPage() {
  const [input, setInput] = useState('')
  const [tx, setTx] = useState(null)
  const [prevTx, setPrevTx] = useState(null)
  const [showDiff, setShowDiff] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [simulateMode, setSimulateMode] = useState(false)
  const [simulationResult, setSimulationResult] = useState(null)
  const { config, network, setNetwork } = useNetwork()
  const { history, addToHistory, removeFromHistory, clearHistory } = useTransactionHistory()
  const navigate = useNavigate()
  const { hash: urlHash } = useParams()
  const inputRef = useRef(null)

  useKeyboard({
    '/': () => {
      inputRef.current?.focus()
    },
    escape: () => {
      setInput('')
      inputRef.current?.blur()
    },
    'ctrl+c': () => {
      if (tx?.hash) {
        navigator.clipboard.writeText(tx.hash)
      }
    },
    'n/t': () => {
      setNetwork(network === 'mainnet' ? 'testnet' : 'mainnet')
    }
  })

  // Handle deep-linked transaction hash from URL
  useEffect(() => {
    if (urlHash && !tx && !loading) {
      setInput(urlHash)
      handleInspect(urlHash)
    }
  }, [urlHash])

  useEffect(() => {
    setHorizonUrl(config.horizonUrl)
  }, [config.horizonUrl])

  async function handleInspect(value) {
    const query = (value || input).trim()
    if (!query) return
    setLoading(true)
    setError(null)
    setSimulationResult(null)
    if (tx && tx.hash) {
      setPrevTx(tx)
    }
    setTx(null)
    
    // Update URL for shareable link (only for valid hashes, not XDR)
    if (query.length === 64 && !tx?.xdr_only) {
      navigate(`/tx/${query}`, { replace: true })
    }
    
    try {
      if (simulateMode && query.length > 64) {
        // Simulate XDR
        const result = await simulateTransaction(query)
        setSimulationResult(result)
      } else {
        // Normal fetch
        const result = await fetchTransaction(query)
        setTx(result)
        if (!result.xdr_only) {
          addToHistory(result)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleHistorySelect(hash) {
    setInput(hash)
    setSimulateMode(false)
    handleInspect(hash)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleInspect()
  }

  async function loadExample() {
    setLoading(true)
    setError(null)
    setTx(null)
    setSimulateMode(false)
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

      <TransactionSearch onSelectTransaction={(hash) => { setSimulateMode(false); handleInspect(hash); }} />

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
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Transaction hash or XDR…"
            spellCheck={false}
            autoComplete="off"
          />
          {input && (
            <button 
              className={styles.clearBtn} 
              onClick={(e) => {
                e.preventDefault()
                setInput('')
                setShowDropdown(true)
              }}
              aria-label="Clear input"
            >
              <X size={14} />
            </button>
          )}
          {showDropdown && history.length > 0 && (
            <div className={styles.dropdown}>
              {history.map(item => (
                <button
                  key={item.hash}
                  className={styles.dropdownItem}
                  onClick={() => {
                    setInput(item.hash)
                    handleHistorySelect(item.hash)
                    setShowDropdown(false)
                  }}
                >
                  <span className={styles.dropdownHash}>
                    {item.hash.slice(0, 10)}…{item.hash.slice(-8)}
                  </span>
                  <span className={styles.dropdownMeta}>
                    {item.operationCount} op{item.operationCount !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          className={`${styles.btnSecondary} ${simulateMode ? styles.btnSecondaryActive : ''}`} 
          onClick={() => setSimulateMode(!simulateMode)}
          disabled={loading}
          style={{ minWidth: 'auto', padding: '0 12px' }}
        >
          <Eye size={14} style={{ marginRight: 6 }} />
          Simulate
        </button>
        <button className={styles.btnPrimary} onClick={() => handleInspect()} disabled={loading}>
          {loading ? <Loader2 size={15} className={styles.spin} /> : simulateMode ? 'Simulate' : 'Inspect'}
        </button>
        <button className={styles.btnSecondary} onClick={loadExample} disabled={loading}>
          Example
        </button>
      </div>

      {simulateMode && (
        <div className={styles.simulateNotice}>
          Simulate mode enabled: paste an XDR to run a dry-run simulation (no transaction will be broadcast)
        </div>
      )}

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
      {tx && prevTx && (
        <>
          <button 
            className={styles.diffBtn}
            onClick={() => setShowDiff(!showDiff)}
          >
            <GitCompare size={14} />
            {showDiff ? 'Hide Diff' : 'Show Diff with Previous'}
          </button>
          {showDiff && <TransactionDiff tx1={prevTx} tx2={tx} onClose={() => setShowDiff(false)} />}
        </>
      )}

      {simulationResult && (
        <div className={styles.wrap}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.tabActive}`}>Simulation Result</button>
          </div>
          <div className={styles.section}>
            <div className={styles.rawBlock}>
              <div className={styles.rawHeader}>
                <span className={styles.rawLabel}>Simulation Output</span>
              </div>
              <pre className={styles.xdr}>{JSON.stringify(simulationResult, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {!tx && !simulationResult && !loading && !error && (
        <div className={styles.empty}>
          <p>Enter a transaction hash above to get started, or try the <button className={styles.link} onClick={loadExample}>example transaction</button>.</p>
        </div>
      )}
    </div>
  )
}

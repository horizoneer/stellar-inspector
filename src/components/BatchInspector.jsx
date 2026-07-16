import React, { useState } from 'react'
import { Loader2, AlertCircle, X, CheckCircle2 } from 'lucide-react'
import { fetchTransaction } from '../utils/stellar'
import styles from './BatchInspector.module.css'

export default function BatchInspector({ onTransactionSelect }) {
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleBatchInspect() {
    const lines = input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (lines.length === 0) return

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const transactionPromises = lines.map(async (hash) => {
        try {
          const tx = await fetchTransaction(hash)
          return { hash, tx, error: null }
        } catch (err) {
          return { hash, tx: null, error: err.message }
        }
      })

      const batchResults = await Promise.all(transactionPromises)
      setResults(batchResults)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setInput('')
    setResults([])
    setError(null)
  }

  function handleSelectTransaction(hash) {
    if (onTransactionSelect) {
      onTransactionSelect(hash)
    }
  }

  const successCount = results.filter(r => r.tx).length
  const errorCount = results.filter(r => r.error).length

  return (
    <div className={styles.batchInspector}>
      <div className={styles.header}>
        <h3 className={styles.title}>Batch Transaction Inspector</h3>
        <p className={styles.subtitle}>
          Enter multiple transaction hashes (one per line) to inspect them in batch
        </p>
      </div>

      <div className={styles.inputSection}>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste transaction hashes here, one per line..."
          rows={6}
          spellCheck={false}
        />
        <div className={styles.buttonRow}>
          <button
            className={styles.inspectButton}
            onClick={handleBatchInspect}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spin} />
                Inspecting...
              </>
            ) : (
              'Inspect All'
            )}
          </button>
          <button
            className={styles.clearButton}
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsSummary}>
              {successCount} successful, {errorCount} failed
            </span>
          </div>
          <div className={styles.resultsList}>
            {results.map((result, index) => (
              <div
                key={index}
                className={`${styles.resultItem} ${result.error ? styles.resultError : styles.resultSuccess}`}
              >
                <div className={styles.resultStatus}>
                  {result.error ? (
                    <X size={16} className={styles.errorIcon} />
                  ) : (
                    <CheckCircle2 size={16} className={styles.successIcon} />
                  )}
                </div>
                <div className={styles.resultContent}>
                  <span className={styles.resultHash}>{result.hash}</span>
                  {result.error ? (
                    <span className={styles.resultErrorText}>{result.error}</span>
                  ) : (
                    <span className={styles.resultSuccessText}>
                      {result.tx.operation_count} operation{result.tx.operation_count !== 1 ? 's' : ''} · 
                      {result.tx.successful ? ' Success' : ' Failed'}
                    </span>
                  )}
                </div>
                {result.tx && onTransactionSelect && (
                  <button
                    className={styles.viewButton}
                    onClick={() => handleSelectTransaction(result.hash)}
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

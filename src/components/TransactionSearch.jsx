import React, { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { searchTransactions } from '../utils/stellar'
import styles from './TransactionSearch.module.css'

export default function TransactionSearch({ onSelectTransaction }) {
  const [sourceAccount, setSourceAccount] = useState('')
  const [memoText, setMemoText] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults([])

    try {
      const transactions = await searchTransactions({
        sourceAccount,
        memoText,
        startDate,
        endDate
      })
      setResults(transactions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setSourceAccount('')
    setMemoText('')
    setStartDate('')
    setEndDate('')
    setResults([])
    setError(null)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Search size={14} strokeWidth={1.5} />
        <span className={styles.title}>Search Transactions</span>
        <button 
          className={styles.toggleFilterBtn}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={14} />
          {showFilters ? 'Hide' : 'Filters'}
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSearch}>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="Source Account"
            value={sourceAccount}
            onChange={(e) => setSourceAccount(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className={styles.filters}>
            <div className={styles.filterRow}>
              <input
                className={styles.input}
                type="text"
                placeholder="Memo Text"
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
              />
            </div>
            <div className={styles.dateRow}>
              <input
                className={styles.input}
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                className={styles.input}
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button className={styles.btnSecondary} type="button" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className={styles.error}>
          <X size={14} />
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className={styles.results}>
          <div className={styles.resultsTitle}>Results ({results.length})</div>
          <div className={styles.resultsList}>
            {results.map((tx) => (
              <button
                key={tx.hash}
                className={styles.resultItem}
                onClick={() => onSelectTransaction(tx.hash)}
              >
                <div className={styles.resultHash}>{tx.hash.slice(0, 12)}…{tx.hash.slice(-8)}</div>
                <div className={styles.resultMeta}>
                  {new Date(tx.created_at).toLocaleString()} · {tx.operation_count} ops
                </div>
                {tx.memo && <div className={styles.resultMemo}>Memo: {tx.memo}</div>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

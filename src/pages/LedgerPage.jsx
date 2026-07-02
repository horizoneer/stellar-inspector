import React, { useState, useEffect, useCallback } from 'react'
import { Clock, RefreshCw, Activity, Database } from 'lucide-react'
import { useNetwork } from '../context/NetworkContext'
import { fetchLatestLedger } from '../utils/stellar'
import styles from './LedgerPage.module.css'

export default function LedgerPage() {
  const [ledger, setLedger] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(5)
  const { config } = useNetwork()

  const loadLatestLedger = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const latestLedger = await fetchLatestLedger()
      setLedger(latestLedger)
      setCountdown(5)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLatestLedger()
  }, [loadLatestLedger])

  useEffect(() => {
    if (countdown === 0) {
      loadLatestLedger()
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, loadLatestLedger])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ledger Explorer</h1>
        <div className={styles.countdown}>
          <Clock size={14} strokeWidth={1.5} />
          <span>Auto-refresh in {countdown}s</span>
          <button 
            className={styles.refreshBtn} 
            onClick={loadLatestLedger}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? styles.spin : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {loading && !ledger && (
        <div className={styles.loading}>
          <RefreshCw size={24} className={styles.spin} />
          Loading latest ledger...
        </div>
      )}

      {ledger && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Database size={20} strokeWidth={1.5} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Sequence Number</div>
              <div className={styles.statValue}>{ledger.sequence?.toLocaleString()}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Activity size={20} strokeWidth={1.5} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Transaction Count</div>
              <div className={styles.statValue}>{ledger.transaction_count?.toLocaleString()}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Activity size={20} strokeWidth={1.5} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Operation Count</div>
              <div className={styles.statValue}>{ledger.operation_count?.toLocaleString()}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Database size={20} strokeWidth={1.5} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Base Fee</div>
              <div className={styles.statValue}>
                {ledger.base_fee_in_stroops ? `${(ledger.base_fee_in_stroops / 1e7).toFixed(7)} XLM` : '—'}
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Database size={20} strokeWidth={1.5} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Total XLM in Circulation</div>
              <div className={styles.statValue}>
                {ledger.total_coins ? `${(ledger.total_coins / 1e7).toLocaleString()} XLM` : '—'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

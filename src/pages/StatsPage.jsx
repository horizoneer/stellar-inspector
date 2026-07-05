import React, { useState, useEffect } from 'react'
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import { useNetwork } from '../context/NetworkContext'
import { fetchLedgers, fetchFeeStats, setHorizonUrl } from '../utils/stellar'
import styles from './StatsPage.module.css'

export default function StatsPage() {
  const { config } = useNetwork()
  const [ledgers, setLedgers] = useState([])
  const [feeStats, setFeeStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      setHorizonUrl(config.horizonUrl)
      try {
        const [ledgerData, feeStatsData] = await Promise.all([
          fetchLedgers(50),
          fetchFeeStats()
        ])
        setLedgers(ledgerData)
        setFeeStats(feeStatsData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [config.horizonUrl])

  const maxFee = ledgers.length > 0
    ? Math.max(...ledgers.map(l => l.base_fee_in_stroops || 100))
    : 100

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <TrendingUp size={18} strokeWidth={1.5} />
        <h1 className={styles.title}>Network Stats</h1>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <Loader2 size={20} className={styles.spin} />
          Loading stats...
        </div>
      )}

      {feeStats && (
        <div className={styles.feeStatsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Last Ledger Fee</span>
            <span className={styles.statValue}>
              {feeStats.last_ledger_base_fee ? `${(feeStats.last_ledger_base_fee / 1e7).toFixed(7)} XLM` : '—'}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Min Fee</span>
            <span className={styles.statValue}>
              {feeStats.fee_charged?.min ? `${(feeStats.fee_charged.min / 1e7).toFixed(7)} XLM` : '—'}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Max Fee</span>
            <span className={styles.statValue}>
              {feeStats.fee_charged?.max ? `${(feeStats.fee_charged.max / 1e7).toFixed(7)} XLM` : '—'}
            </span>
          </div>
        </div>
      )}

      {ledgers.length > 0 && (
        <div className={styles.histogramContainer}>
          <h2 className={styles.histogramTitle}>Fee History (Last 50 Ledgers)</h2>
          <div className={styles.histogram}>
            {ledgers.slice().reverse().map((ledger, index) => {
              const height = maxFee > 0
                ? Math.max(4, ((ledger.base_fee_in_stroops || 100) / maxFee) * 100)
                : 20
              return (
                <div
                  key={ledger.sequence}
                  className={styles.histogramBar}
                  title={`Ledger ${ledger.sequence}: ${ledger.base_fee_in_stroops || 100} stroops`}
                >
                  <div
                    className={styles.histogramBarFill}
                    style={{ height: `${height}%` }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

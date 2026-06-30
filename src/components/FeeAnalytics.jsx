import React, { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import { fetchFeeStats } from '../utils/stellar'
import styles from './FeeAnalytics.module.css'

export default function FeeAnalytics({ feeCharged, maxFee }) {
  const [feeStats, setFeeStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadFeeStats() {
      setLoading(true)
      setError(null)
      try {
        const stats = await fetchFeeStats()
        setFeeStats(stats)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadFeeStats()
  }, [])

  if (!feeCharged) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <BarChart3 size={14} strokeWidth={1.5} />
        <span className={styles.title}>Fee Analytics</span>
      </div>
      <div className={styles.content}>
        <div className={styles.row}>
          <span className={styles.label}>Fee Paid</span>
          <span className={styles.value}>{(feeCharged / 1e7).toFixed(7)} XLM</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Max Fee</span>
          <span className={styles.value}>{(maxFee / 1e7).toFixed(7)} XLM</span>
        </div>
        {!loading && !error && feeStats && (
          <>
            <div className={styles.row}>
              <span className={styles.label}>Base Fee</span>
              <span className={styles.value}>{(feeStats.last_ledger_base_fee / 1e7).toFixed(7)} XLM</span>
            </div>
            <div className={styles.chart}>
              <div className={styles.chartRow}>
                <span className={styles.chartLabel}>P10</span>
                <div 
                  className={styles.chartBar} 
                  style={{ width: `${Math.min(100, (feeStats.fee_charged.p10 / feeStats.fee_charged.p99) * 100)}%` }}
                />
                <span className={styles.chartValue}>{(feeStats.fee_charged.p10 / 1e7).toFixed(7)} XLM</span>
              </div>
              <div className={styles.chartRow}>
                <span className={styles.chartLabel}>P50</span>
                <div 
                  className={styles.chartBar} 
                  style={{ width: `${Math.min(100, (feeStats.fee_charged.p50 / feeStats.fee_charged.p99) * 100)}%` }}
                />
                <span className={styles.chartValue}>{(feeStats.fee_charged.p50 / 1e7).toFixed(7)} XLM</span>
              </div>
              <div className={styles.chartRow}>
                <span className={styles.chartLabel}>P90</span>
                <div 
                  className={styles.chartBar} 
                  style={{ width: `${Math.min(100, (feeStats.fee_charged.p90 / feeStats.fee_charged.p99) * 100)}%` }}
                />
                <span className={styles.chartValue}>{(feeStats.fee_charged.p90 / 1e7).toFixed(7)} XLM</span>
              </div>
              <div className={styles.chartRow}>
                <span className={styles.chartLabel}>P99</span>
                <div 
                  className={styles.chartBar} 
                  style={{ width: '100%' }}
                />
                <span className={styles.chartValue}>{(feeStats.fee_charged.p99 / 1e7).toFixed(7)} XLM</span>
              </div>
            </div>
          </>
        )}
        {loading && <div className={styles.loading}>Loading fee stats...</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  )
}

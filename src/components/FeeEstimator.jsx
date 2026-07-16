import React, { useState } from 'react'
import { Calculator, Loader2, AlertCircle } from 'lucide-react'
import { fetchFeeStats } from '../utils/stellar'
import styles from './FeeEstimator.module.css'

const OPERATION_FEES = {
  payment: 100,
  create_account: 100,
  change_trust: 100,
  manage_sell_offer: 100,
  manage_buy_offer: 100,
  path_payment_strict_send: 100,
  path_payment_strict_receive: 100,
  set_options: 100,
  account_merge: 100,
  manage_data: 100,
  bump_sequence: 100,
  create_passive_sell_offer: 100,
  invoke_host_function: 100,
  liquidity_pool_deposit: 100,
  liquidity_pool_withdraw: 100,
  create_claimable_balance: 100,
  claim_claimable_balance: 100,
  clawback: 100,
  set_trust_line_flags: 100,
}

export default function FeeEstimator() {
  const [operations, setOperations] = useState('')
  const [estimatedFee, setEstimatedFee] = useState(null)
  const [feeStats, setFeeStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function loadFeeStats() {
    try {
      const stats = await fetchFeeStats()
      setFeeStats(stats)
      return stats
    } catch (err) {
      console.error('Failed to load fee stats:', err)
      return null
    }
  }

  async function handleEstimate() {
    const opCount = parseInt(operations) || 0
    if (opCount <= 0) {
      setError('Please enter a valid number of operations')
      return
    }

    setLoading(true)
    setError(null)
    setEstimatedFee(null)

    try {
      const stats = await loadFeeStats()
      
      const baseFee = stats?.last_ledger_base_fee || 100
      const estimatedTotal = opCount * baseFee
      
      setEstimatedFee({
        operationCount: opCount,
        baseFee,
        estimatedTotal,
        feeStats: stats,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.feeEstimator}>
      <div className={styles.header}>
        <Calculator size={20} className={styles.icon} />
        <h3 className={styles.title}>Transaction Fee Estimator</h3>
      </div>
      <p className={styles.subtitle}>
        Estimate the fee for a transaction based on the number of operations
      </p>

      <div className={styles.inputSection}>
        <label className={styles.label}>Number of Operations</label>
        <input
          type="number"
          min="1"
          max="100"
          value={operations}
          onChange={(e) => setOperations(e.target.value)}
          className={styles.input}
          placeholder="e.g., 5"
        />
        <button
          className={styles.estimateButton}
          onClick={handleEstimate}
          disabled={loading || !operations}
        >
          {loading ? (
            <>
              <Loader2 size={16} className={styles.spin} />
              Estimating...
            </>
          ) : (
            'Estimate Fee'
          )}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {estimatedFee && (
        <div className={styles.results}>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Base Fee (per operation)</span>
            <span className={styles.resultValue}>{estimatedFee.baseFee} stroops</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Number of Operations</span>
            <span className={styles.resultValue}>{estimatedFee.operationCount}</span>
          </div>
          <div className={styles.resultRow.highlight}>
            <span className={styles.resultLabel}>Estimated Total Fee</span>
            <span className={styles.resultValue}>
              {estimatedFee.estimatedTotal.toLocaleString()} stroops
              <span className={styles.xlmEquivalent}>
                ({(estimatedFee.estimatedTotal / 1e7).toFixed(7)} XLM)
              </span>
            </span>
          </div>
          {feeStats && (
            <div className={styles.feeStats}>
              <h4 className={styles.statsTitle}>Current Network Fee Stats</h4>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Last Ledger Base Fee</span>
                <span className={styles.statValue}>{feeStats.last_ledger_base_fee} stroops</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Last Ledger Fee (min)</span>
                <span className={styles.statValue}>{feeStats.last_ledger_fee?.min || 'N/A'} stroops</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Last Ledger Fee (max)</span>
                <span className={styles.statValue}>{feeStats.last_ledger_fee?.max || 'N/A'} stroops</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

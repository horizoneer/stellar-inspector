import React, { useState } from 'react'
import { Search, Loader2, AlertCircle, Coins } from 'lucide-react'
import { useNetwork } from '../context/NetworkContext'
import { fetchClaimableBalances, setHorizonUrl } from '../utils/stellar'
import styles from './ClaimablePage.module.css'

function formatPredicate(predicate) {
  if (!predicate || (!predicate.unconditional && !predicate.and && !predicate.or && !predicate.not && !predicate.rel_before && !predicate.rel_after && !predicate.abs_before && !predicate.abs_after)) {
    return 'Unconditional'
  }
  let conditions = []
  
  if (predicate.abs_before) {
    conditions.push(`Claimable after ${new Date(predicate.abs_before).toLocaleString()}`)
  }
  if (predicate.abs_after) {
    conditions.push(`Claimable before ${new Date(predicate.abs_after).toLocaleString()}`)
  }
  if (predicate.rel_before) {
    conditions.push(`Claimable ${predicate.rel_before} seconds after creation`)
  }
  if (predicate.rel_after) {
    conditions.push(`Claimable ${predicate.rel_after} seconds before creation`)
  }
  if (conditions.length > 0) {
    return conditions.join('; ')
  }
  return 'Conditional'
}

export default function ClaimablePage() {
  const { config } = useNetwork()
  const [claimant, setClaimant] = useState('')
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!claimant.trim()) return
    setLoading(true)
    setError(null)
    setHorizonUrl(config.horizonUrl)
    try {
      const data = await fetchClaimableBalances(claimant.trim())
      setBalances(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Coins size={18} strokeWidth={1.5} />
        <h1 className={styles.title}>Claimable Balances</h1>
      </div>

      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.searchInputWrap}>
          <Search size={15} strokeWidth={1.5} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Enter claimant address"
            value={claimant}
            onChange={(e) => setClaimant(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className={styles.searchBtn}
          disabled={loading}
        >
          {loading ? <Loader2 size={14} className={styles.spin} /> : 'Search'}
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {balances.length > 0 && (
        <div className={styles.balancesList}>
          {balances.map((balance, index) => (
            <div key={balance.id || index} className={styles.balanceCard}>
              <div className={styles.balanceHeader}>
                <span className={styles.asset}>
                  {balance.asset_type === 'native' ? 'XLM' : `${balance.asset_code} · ${balance.asset_issuer?.slice(0, 8)}…${balance.asset_issuer?.slice(-4)}`}
                </span>
                <span className={styles.amount}>{parseFloat(balance.amount).toLocaleString(undefined, { maximumFractionDigits: 7 })}</span>
              </div>
              <div className={styles.balanceDetails}>
                {balance.sponsor && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Sponsor</span>
                    <span className={styles.detailValue}>{balance.sponsor.slice(0, 8)}…{balance.sponsor.slice(-4)}</span>
                  </div>
                )}
                {balance.claimants && balance.claimants.length > 0 && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Claimants</span>
                    <span className={styles.detailValue}>
                      {balance.claimants.map((c, i) => (
                        <div key={i} className={styles.claimant}>
                          {c.destination.slice(0, 8)}…{c.destination.slice(-4)}
                          <span className={styles.predicate}>
                            {formatPredicate(c.predicate)}
                          </span>
                        </div>
                      ))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

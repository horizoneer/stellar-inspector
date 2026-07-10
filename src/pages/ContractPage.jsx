import React, { useState } from 'react'
import { useNetwork } from '../context/NetworkContext'
import CopyButton from '../components/CopyButton'
import styles from './ContractPage.module.css'

export default function ContractPage() {
  const { config } = useNetwork()
  const { horizonUrl } = config
  const [contractId, setContractId] = useState('')
  const [loading, setLoading] = useState(false)
  const [contractData, setContractData] = useState(null)
  const [invocations, setInvocations] = useState([])
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!contractId.trim()) return

    setLoading(true)
    setError(null)
    setContractData(null)
    setInvocations([])

    try {
      const accountRes = await fetch(`${horizonUrl}/accounts/${contractId.trim()}`)
      if (!accountRes.ok) throw new Error(`Failed to fetch contract: ${accountRes.status}`)
      const accountData = await accountRes.json()
      setContractData(accountData)

      const txRes = await fetch(`${horizonUrl}/accounts/${contractId.trim()}/transactions?limit=10&order=desc`)
      if (txRes.ok) {
        const txData = await txRes.json()
        setInvocations(txData._embedded.records)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Soroban Contract Explorer</h1>
        <p>Explore Soroban smart contracts on Stellar</p>
      </div>

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          placeholder="Enter contract ID (address)"
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Loading...' : 'Explore'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {contractData && (
        <div className={styles.contractDetails}>
          <div className={styles.section}>
            <h2>Contract Information</h2>
            <div className={styles.detailRow}>
              <span className={styles.label}>Contract ID:</span>
              <span className={styles.value}>
                {contractData.id}
                <CopyButton text={contractData.id} />
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Sequence Number:</span>
              <span className={styles.value}>{contractData.sequence}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label">Subentry Count:</span>
              <span className={styles.value}>{contractData.subentry_count}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Balances</h2>
            <div className={styles.balances}>
              {contractData.balances?.map((balance, idx) => (
                <div key={idx} className={styles.balance}>
                  <span>{balance.asset_type === 'native' ? 'XLM' : `${balance.asset_code} (${balance.asset_issuer.slice(0, 8)}...)`}</span>
                  <span>{balance.balance}</span>
                </div>
              ))}
            </div>
          </div>

          {contractData.data && Object.keys(contractData.data).length > 0 && (
            <div className={styles.section}>
              <h2>Contract Data</h2>
              <div className={styles.dataGrid}>
                {Object.entries(contractData.data).map(([key, value]) => (
                  <div key={key} className={styles.dataItem}>
                    <span className={styles.dataKey}>{key}</span>
                    <span className={styles.dataValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invocations.length > 0 && (
            <div className={styles.section}>
              <h2>Recent Invocations</h2>
              <div className={styles.invocations}>
                {invocations.map((tx) => (
                  <div key={tx.hash} className={styles.invocationItem}>
                    <a
                      href={`/tx/${tx.hash}`}
                      className={styles.txLink}
                    >
                      <div className={styles.txHash}>{tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}</div>
                      <div className={styles.txMeta}>
                        <span>{new Date(tx.created_at).toLocaleString()}</span>
                        <span>{tx.successful ? '✓ Success' : '✗ Failed'}</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Wallet, Loader2, AlertCircle, Copy, ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { useNetwork } from '../context/NetworkContext'
import { fetchAccount, fetchAccountTransactions } from '../utils/stellar'
import { setHorizonUrl } from '../utils/stellar'
import CopyButton from '../components/CopyButton'
import styles from './AccountPage.module.css'

export default function AccountPage() {
  const { address } = useParams()
  const { config } = useNetwork()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setHorizonUrl(config.horizonUrl)
  }, [config.horizonUrl])

  useEffect(() => {
    async function loadData() {
      if (!address) return
      setLoading(true)
      setError(null)
      try {
        const [accountData, txData] = await Promise.all([
          fetchAccount(address),
          fetchAccountTransactions(address)
        ])
        setAccount(accountData)
        setTransactions(txData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [address])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <Loader2 size={20} className={styles.spin} />
          <span>Loading account...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <AlertCircle size={15} />
          {error}
        </div>
      </div>
    )
  }

  const balances = account?.balances || []
  const nativeBalance = balances.find(b => b.asset_type === 'native')
  const otherBalances = balances.filter(b => b.asset_type !== 'native')
  const trustlines = otherBalances.length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Wallet size={18} strokeWidth={1.5} />
        <h1 className={styles.title}>Account</h1>
      </div>

      <div className={styles.addressRow}>
        <span className={styles.address}>{address}</span>
        <CopyButton value={address} label="Account address" />
        <a
          href={`${config.horizonUrl}/accounts/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink}
          aria-label="View on Horizon"
        >
          <ExternalLinkIcon size={14} />
        </a>
      </div>

      {account && (
        <>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{nativeBalance ? parseFloat(nativeBalance.balance).toFixed(2) : '0.00'}</span>
              <span className={styles.statLabel}>XLM Balance</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{trustlines}</span>
              <span className={styles.statLabel}>Trustlines</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{account.subentry_count || 0}</span>
              <span className={styles.statLabel}>Subentries</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{account.sequence ? 'Active' : 'New'}</span>
              <span className={styles.statLabel}>Status</span>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Balances</h2>
            <div className={styles.balanceList}>
              {balances.map((balance, i) => (
                <div key={i} className={styles.balanceItem}>
                  <div className={styles.balanceAsset}>
                    {balance.asset_type === 'native' ? (
                      <span className={styles.assetName}>XLM</span>
                    ) : (
                      <>
                        <span className={styles.assetName}>{balance.asset_code}</span>
                        <span className={styles.assetIssuer}>{balance.asset_issuer?.slice(0, 8)}…{balance.asset_issuer?.slice(-6)}</span>
                      </>
                    )}
                  </div>
                  <div className={styles.balanceAmount}>
                    {parseFloat(balance.balance).toLocaleString(undefined, { maximumFractionDigits: 7 })}
                  </div>
                  <div className={styles.balanceLimit}>
                    {balance.limit && (
                      <span className={styles.limit}>Limit: {parseFloat(balance.limit).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className={styles.muted}>No recent transactions found for this account.</p>
            ) : (
              <div className={styles.txList}>
                {transactions.map(tx => (
                  <Link to={`/tx/${tx.hash}`} key={tx.hash} className={styles.txItem}>
                    <div className={styles.txHash}>
                      {tx.hash.slice(0, 16)}…{tx.hash.slice(-8)}
                    </div>
                    <div className={styles.txMeta}>
                      <span className={`${styles.txStatus} ${tx.successful ? styles.txSuccess : styles.txFailed}`}>
                        {tx.successful ? 'Success' : 'Failed'}
                      </span>
                      <span className={styles.txDate}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Signers</h2>
            <div className={styles.signerList}>
              {account.signers?.map((signer, i) => (
                <div key={i} className={styles.signerItem}>
                  <span className={styles.signerKey}>{signer.key?.slice(0, 16)}…{signer.key?.slice(-8)}</span>
                  <span className={styles.signerWeight}>Weight: {signer.weight}</span>
                  {signer.key === account.account_id && (
                    <span className={styles.signerBadge}>Primary</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.rawData}>
            <h2 className={styles.sectionTitle}>Raw Account Data</h2>
            <pre className={styles.rawJson}>{JSON.stringify(account, null, 2)}</pre>
          </div>
        </>
      )}
    </div>
  )
}

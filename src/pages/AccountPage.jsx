import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Wallet, Loader2, AlertCircle, Copy, ExternalLink as ExternalLinkIcon, Share2 } from 'lucide-react'
import { useNetwork } from '../context/NetworkContext'
import { fetchAccount, fetchAccountTransactions } from '../utils/stellar'
import { setHorizonUrl } from '../utils/stellar'
import CopyButton from '../components/CopyButton'
import Toast from '../components/Toast'
import { useClipboard } from '../hooks/useClipboard'
import styles from './AccountPage.module.css'

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHr = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHr / 24);

  if (diffInSec < 60) return 'Just now';
  if (diffInMin < 60) return `${diffInMin} minute${diffInMin !== 1 ? 's' : ''} ago`;
  if (diffInHr < 24) return `${diffInHr} hour${diffInHr !== 1 ? 's' : ''} ago`;
  if (diffInDay < 7) return `${diffInDay} day${diffInDay !== 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString();
}

export default function AccountPage() {
  const { address } = useParams()
  const { config, network } = useNetwork()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('Copied!')
  const { copy, copied } = useClipboard()

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
        <button 
          className={styles.shareBtn} 
          onClick={() => {
            const shareUrl = `${window.location.origin}/account/${address}`
            copy(shareUrl, 'account-share')
            setToastMessage('Link copied!')
            setToastVisible(true)
            setTimeout(() => setToastVisible(false), 2000)
          }}
          aria-label="Share account"
        >
          <Share2 size={14} />
        </button>
        <a
          href={`${config.horizonUrl}/accounts/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink}
          aria-label="View on Horizon"
        >
          <ExternalLinkIcon size={14} />
        </a>
        <a
          href={`https://stellar.expert/explorer/${network}/account/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink}
          aria-label="View on Stellar Expert"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
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
                    {formatRelativeTime(tx.created_at)}
                  </span>
                </div>
              </Link>
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Thresholds</h2>
            <div className={styles.thresholdsList}>
              <div className={styles.thresholdItem}>
                <span className={styles.thresholdLabel}>Low</span>
                <span className={styles.thresholdValue}>{account.thresholds?.low_threshold || 0}</span>
              </div>
              <div className={styles.thresholdItem}>
                <span className={styles.thresholdLabel}>Medium</span>
                <span className={styles.thresholdValue}>{account.thresholds?.med_threshold || 0}</span>
              </div>
              <div className={styles.thresholdItem}>
                <span className={styles.thresholdLabel}>High</span>
                <span className={styles.thresholdValue}>{account.thresholds?.high_threshold || 0}</span>
              </div>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Signers</h2>
            <div className={styles.signerList}>
              {account.signers?.map((signer, i) => (
                <div key={i} className={styles.signerItem}>
                  <span className={styles.signerKey}>{signer.key?.slice(0, 16)}…{signer.key?.slice(-8)}</span>
                  <CopyButton value={signer.key} label="Signer key" />
                  <div className={styles.signerWeightContainer}>
                    <span className={styles.signerWeight}>Weight: {signer.weight}</span>
                    <div className={styles.signerProgress}>
                      <div 
                        className={styles.signerProgressFill} 
                        style={{ 
                          width: `${Math.min(100, (signer.weight / (account.thresholds?.high_threshold || 1)) * 100)}%` 
                        }} 
                      />
                    </div>
                  </div>
                  {signer.key === account.account_id && (
                    <span className={styles.signerBadge}>Primary</span>
                  )}
                  <a
                    href={`https://stellar.expert/explorer/${network}/account/${signer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.externalLink}
                    aria-label="View signer on Stellar Expert"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
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
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  )
}

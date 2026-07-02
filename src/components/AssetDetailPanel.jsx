import React, { useState, useEffect } from 'react'
import { X, Database, Users, ArrowRight } from 'lucide-react'
import { fetchAssets } from '../utils/stellar'
import styles from './AssetDetailPanel.module.css'

export default function AssetDetailPanel({ assetCode, assetIssuer, onClose }) {
  const [asset, setAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadAsset() {
      try {
        setLoading(true)
        setError(null)
        const assetData = await fetchAssets(assetCode, assetIssuer)
        setAsset(assetData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadAsset()
  }, [assetCode, assetIssuer])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            {assetCode} · {assetIssuer.slice(0, 8)}…{assetIssuer.slice(-4)}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {loading && (
          <div className={styles.loading}>Loading asset details…</div>
        )}

        {asset && (
          <div className={styles.content}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Issuer Account</span>
              <div className={styles.fieldValue}>
                <span className={styles.address}>{asset.asset_issuer}</span>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <Database size={16} strokeWidth={1.5} />
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Total Supply</div>
                  <div className={styles.statValue}>{asset.amount?.toLocaleString()}</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <Users size={16} strokeWidth={1.5} />
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Number of Holders</div>
                  <div className={styles.statValue}>{asset.num_accounts?.toLocaleString()}</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <ArrowRight size={16} strokeWidth={1.5} />
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Trustline Count</div>
                  <div className={styles.statValue}>{asset.num_accounts?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

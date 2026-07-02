import React, { useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Share2, FileText, Hash, Lock, RefreshCw } from 'lucide-react'
import CopyButton from './CopyButton'
import Toast from './Toast'
import OperationFilter from './OperationFilter'
import ExportButton from './ExportButton'
import FeeAnalytics from './FeeAnalytics'
import AssetDetailPanel from './AssetDetailPanel'
import { useClipboard } from '../hooks/useClipboard'
import { useNetwork } from '../context/NetworkContext'
import styles from './TransactionView.module.css'

SyntaxHighlighter.registerLanguage('json', json)

const TABS = ['Overview', 'Operations', 'Raw data']

function formatAssetForDisplay(asset) {
  return asset?.display || asset || 'XLM (native)'
}

export default function TransactionView({ tx }) {
  const [tab, setTab] = useState('Overview')
  const [operationFilter, setOperationFilter] = useState('all')
  const [displayUnit, setDisplayUnit] = useState('xlm') // 'xlm' or 'stroops'
  const { network } = useNetwork()
  const { copy, copied } = useClipboard()
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('Copied!')
  const [assetPanel, setAssetPanel] = useState(null)

  function handleCopy(value, key) {
    copy(value, key)
    setToastMessage('Copied!')
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2000)
  }

  function handleShare() {
    if (!tx.hash) return
    const url = `${window.location.origin}/tx/${tx.hash}`
    navigator.clipboard.writeText(url)
    setToastMessage('Link copied!')
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2000)
  }

  function renderAssetValue(value) {
    if (value && typeof value === 'object' && !value.isNative) {
      return (
        <button
          className={styles.assetLink}
          onClick={() => setAssetPanel({ code: value.code, issuer: value.issuer })}
        >
          {formatAssetForDisplay(value)}
        </button>
      )
    }
    return formatAssetForDisplay(value)
  }

  const status = tx.successful === null ? null : tx.successful

  return (
    <div className={styles.wrap}>
      {assetPanel && (
        <AssetDetailPanel
          assetCode={assetPanel.code}
          assetIssuer={assetPanel.issuer}
          onClose={() => setAssetPanel(null)}
        />
      )}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className={styles.section}>
          {status !== null && (
            <div className={styles.metaRow}>
              <span className={`${styles.badge} ${status ? styles.badgeSuccess : styles.badgeDanger}`}>
                {status ? 'Success' : 'Failed'}
              </span>
              {tx.ledger && <span className={styles.metaItem}>Ledger #{tx.ledger.toLocaleString()}</span>}
              {tx.created_at && <span className={styles.metaItem}>{new Date(tx.created_at).toUTCString()}</span>}
              {tx.hash && !tx.xdr_only && (
                <button className={styles.shareBtn} onClick={handleShare} aria-label="Share transaction">
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              )}
              <ExportButton tx={tx} />
            </div>
          )}

          <div className={styles.fields}>
            {tx.hash && (
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Transaction hash</span>
                  <div className={styles.fieldValue}>
                    <span className={styles.fieldText}>{tx.hash}</span>
                    <CopyButton value={tx.hash} label="Transaction hash" />
                    <a 
                      href={`https://stellar.expert/explorer/${network}/tx/${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.externalLinkIcon}
                      aria-label="View on Stellar Expert"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                </div>
              )}
              {tx.source_account && (
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Source account</span>
                  <div className={styles.fieldValue}>
                    <span className={styles.fieldText}>{tx.source_account}</span>
                    <CopyButton value={tx.source_account} label="Source account" />
                    <a 
                      href={`https://stellar.expert/explorer/${network}/account/${tx.source_account}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.externalLinkIcon}
                      aria-label="View on Stellar Expert"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            {tx.fee_charged && (
              <div className={styles.feeField}>
                <div style={{ display: 'flex', flex: 1 }}>
                  <div className={styles.fieldLabel}>Fee charged</div>
                  <div className={styles.fieldValue}>
                    <span className={styles.fieldText}>
                      {displayUnit === 'xlm' 
                        ? `${(tx.fee_charged / 1e7).toFixed(7)} XLM` 
                        : `${tx.fee_charged} stroops`}
                    </span>
                    <CopyButton 
                      value={displayUnit === 'xlm' ? (tx.fee_charged / 1e7).toFixed(7) : tx.fee_charged} 
                      label="Fee" 
                    />
                  </div>
                </div>
                <button 
                  className={styles.unitToggle}
                  onClick={() => setDisplayUnit(displayUnit === 'xlm' ? 'stroops' : 'xlm')}
                >
                  {displayUnit === 'xlm' ? 'Show in stroops' : 'Show in XLM'}
                </button>
              </div>
            )}
            {tx.memo && (
              <div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {tx.memo_type === 'text' && <FileText size={14} />}
                      {tx.memo_type === 'id' && <Hash size={14} />}
                      {tx.memo_type === 'hash' && <Lock size={14} />}
                      {tx.memo_type === 'return' && <RefreshCw size={14} />}
                      Memo ({tx.memo_type})
                    </span>
                  </div>
                  <div className={styles.fieldValue}>
                    <span className={styles.fieldText}>{tx.memo}</span>
                    <CopyButton value={tx.memo} label="Memo" />
                  </div>
                </div>
                {tx.memo_raw && tx.memo_raw !== tx.memo && (
                  <Field label="Memo (raw)" value={tx.memo_raw} onCopy={handleCopy} copyValue={tx.memo_raw} />
                )}
              </div>
            )}
            {tx.operation_count && <Field label="Operation count" value={String(tx.operation_count)} onCopy={handleCopy} />}
          </div>
          <FeeAnalytics feeCharged={tx.fee_charged} maxFee={tx.max_fee} />
        </div>
      )}

      {tab === 'Operations' && (
        <div className={styles.section}>
          {tx.operations.length === 0 ? (
            <p className={styles.muted}>No operations decoded — try a full transaction hash for operation details.</p>
          ) : (
            <>
              <OperationFilter
                value={operationFilter}
                onChange={setOperationFilter}
                operations={tx.operations}
              />
              {tx.operations
                .filter(op => operationFilter === 'all' || op.type === operationFilter)
                .map((op, i) => (
                  <div key={op.id || i} className={styles.opCard}>
                    <div className={styles.opHeader}>
                      <span className={styles.opIndex}>Op {i + 1}</span>
                      <span className={styles.opType}>{formatOpType(op.type)}</span>
                    </div>
                    <div className={styles.opFields}>
                      {Object.entries(op)
                        .filter(([k]) => !['id', 'type', 'type_i', 'created_at'].includes(k))
                        .map(([k, v]) => v && (
                          <div key={k} className={`${styles.opRow} ${k.includes('asset') ? styles.opRowAsset : ''}`}>
                            <span className={styles.opKey}>{k.replace(/_/g, ' ')}</span>
                            <span className={styles.opVal}>
                              {k.includes('asset') ? renderAssetValue(v) : v}
                            </span>
                            <CopyButton value={String(typeof v === 'object' ? formatAssetForDisplay(v) : v)} label={k} />
                            {typeof v === 'string' && v.startsWith('G') && v.length === 56 && (
                              <a
                                href={`https://stellar.expert/explorer/${network}/account/${v}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.externalLinkIcon}
                                aria-label="View account on Stellar Expert"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      )}

      {tab === 'Raw data' && (
        <div className={styles.section}>
          {tx.envelope_xdr && (
            <div className={styles.rawBlock}>
              <div className={styles.rawHeader}>
                <span className={styles.rawLabel}>Envelope XDR</span>
                <button className={styles.copyAll} onClick={() => handleCopy(tx.envelope_xdr, 'xdr')}>
                  {copied === 'xdr' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className={styles.xdr}>{tx.envelope_xdr}</pre>
            </div>
          )}

          {tx.raw && (
            <div className={styles.rawBlock}>
              <div className={styles.rawHeader}>
                <span className={styles.rawLabel}>Raw JSON</span>
                <button className={styles.copyAll} onClick={() => handleCopy(JSON.stringify(tx.raw, null, 2), 'json')}>
                  {copied === 'json' ? 'Copied!' : 'Copy all'}
                </button>
              </div>
              <SyntaxHighlighter
                language="json"
                style={atomOneDark}
                customStyle={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  margin: 0,
                  padding: '1rem',
                  maxHeight: '500px',
                  overflow: 'auto',
                }}
              >
                {JSON.stringify(tx.raw, null, 2)}
              </SyntaxHighlighter>
            </div>
          )}
        </div>
      )}

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  )
}

function Field({ label, value, onCopy, copyValue }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.fieldValue}>
        <span className={styles.fieldText}>{value}</span>
        <CopyButton value={copyValue || value} label={label} />
      </div>
    </div>
  )
}

function formatOpType(type) {
  return type
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

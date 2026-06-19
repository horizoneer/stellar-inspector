import React, { useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import CopyButton from './CopyButton'
import Toast from './Toast'
import { useClipboard } from '../hooks/useClipboard'
import styles from './TransactionView.module.css'

SyntaxHighlighter.registerLanguage('json', json)

const TABS = ['Overview', 'Operations', 'Raw data']

export default function TransactionView({ tx }) {
  const [tab, setTab] = useState('Overview')
  const { copy, copied } = useClipboard()
  const [toastVisible, setToastVisible] = useState(false)

  function handleCopy(value, key) {
    copy(value, key)
    setToastVisible(v => !v)
    setTimeout(() => setToastVisible(false), 2000)
  }

  const status = tx.successful === null ? null : tx.successful

  return (
    <div className={styles.wrap}>
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
            </div>
          )}

          <div className={styles.fields}>
            {tx.hash && <Field label="Transaction hash" value={tx.hash} onCopy={handleCopy} />}
            {tx.source_account && <Field label="Source account" value={tx.source_account} onCopy={handleCopy} />}
            {tx.fee_charged && (
              <Field label="Fee charged" value={`${tx.fee_charged} stroops (${(tx.fee_charged / 1e7).toFixed(7)} XLM)`} onCopy={handleCopy} copyValue={tx.fee_charged} />
            )}
            {tx.memo && <Field label={`Memo (${tx.memo_type})`} value={tx.memo} onCopy={handleCopy} />}
            {tx.operation_count && <Field label="Operation count" value={String(tx.operation_count)} onCopy={handleCopy} />}
          </div>
        </div>
      )}

      {tab === 'Operations' && (
        <div className={styles.section}>
          {tx.operations.length === 0 ? (
            <p className={styles.muted}>No operations decoded — try a full transaction hash for operation details.</p>
          ) : (
            tx.operations.map((op, i) => (
              <div key={op.id || i} className={styles.opCard}>
                <div className={styles.opHeader}>
                  <span className={styles.opIndex}>Op {i + 1}</span>
                  <span className={styles.opType}>{formatOpType(op.type)}</span>
                </div>
                <div className={styles.opFields}>
                  {Object.entries(op)
                    .filter(([k]) => !['id', 'type', 'type_i', 'created_at'].includes(k))
                    .map(([k, v]) => v && (
                      <div key={k} className={styles.opRow}>
                        <span className={styles.opKey}>{k.replace(/_/g, ' ')}</span>
                        <span className={styles.opVal}>{v}</span>
                        <CopyButton value={String(v)} label={k} />
                      </div>
                    ))}
                </div>
              </div>
            ))
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

      <Toast message="Copied!" visible={toastVisible} />
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

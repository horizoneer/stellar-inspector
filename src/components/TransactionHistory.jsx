import React from 'react'
import { Clock, X, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import styles from './TransactionHistory.module.css'

export default function TransactionHistory({ history, onSelect, onRemove, onClear }) {
  if (history.length === 0) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <Clock size={14} strokeWidth={1.5} />
        <span className={styles.title}>Recent Transactions</span>
        <button className={styles.clearBtn} onClick={onClear} aria-label="Clear history">
          <Trash2 size={12} />
        </button>
      </div>
      <div className={styles.list}>
        {history.map((item) => (
          <div key={item.hash} className={styles.item}>
            <button
              className={styles.itemBtn}
              onClick={() => onSelect(item.hash)}
            >
              <span className={styles.hash}>
                {item.hash.slice(0, 8)}…{item.hash.slice(-6)}
              </span>
              <span className={styles.meta}>
                {item.operationCount} op{item.operationCount !== 1 ? 's' : ''}
              </span>
              {item.successful !== null && (
                item.successful
                  ? <CheckCircle size={12} className={styles.success} />
                  : <XCircle size={12} className={styles.failed} />
              )}
            </button>
            <button
              className={styles.removeBtn}
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.hash)
              }}
              aria-label="Remove from history"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

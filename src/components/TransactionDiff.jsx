import React from 'react'
import { GitCompare, Minus, Plus, Edit } from 'lucide-react'
import { diffTransactions } from '../utils/diff'
import styles from './TransactionDiff.module.css'

export default function TransactionDiff({ tx1, tx2, onClose }) {
  if (!tx1 || !tx2) return null

  const diff = diffTransactions(tx1, tx2)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <GitCompare size={14} strokeWidth={1.5} />
        <span className={styles.title}>Transaction Diff</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close diff">×</button>
      </div>
      <div className={styles.content}>
        <div className={styles.sideBySide}>
          <div className={styles.side}>
            <div className={styles.sideTitle}>Transaction 1</div>
            {tx1.hash && <div className={styles.sideHash}>{tx1.hash.slice(0, 16)}…</div>}
          </div>
          <div className={styles.side}>
            <div className={styles.sideTitle}>Transaction 2</div>
            {tx2.hash && <div className={styles.sideHash}>{tx2.hash.slice(0, 16)}…</div>}
          </div>
        </div>

        {diff.source_account && (
          <div className={styles.change}>
            <div className={styles.changeHeader}>
              <Edit size={12} strokeWidth={1.5} />
              Source Account
            </div>
            <div className={styles.sideBySide}>
              <div className={styles.sideValueOld}>{diff.source_account.old}</div>
              <div className={styles.sideValueNew}>{diff.source_account.new}</div>
            </div>
          </div>
        )}

        {diff.fee_charged && (
          <div className={styles.change}>
            <div className={styles.changeHeader}>
              <Edit size={12} strokeWidth={1.5} />
              Fee Charged
            </div>
            <div className={styles.sideBySide}>
              <div className={styles.sideValueOld}>{(diff.fee_charged.old / 1e7).toFixed(7)} XLM</div>
              <div className={styles.sideValueNew}>{(diff.fee_charged.new / 1e7).toFixed(7)} XLM</div>
            </div>
          </div>
        )}

        {diff.memo && (
          <div className={styles.change}>
            <div className={styles.changeHeader}>
              <Edit size={12} strokeWidth={1.5} />
              Memo
            </div>
            <div className={styles.sideBySide}>
              <div className={styles.sideValueOld}>
                {diff.memo.old.type} · {diff.memo.old.value}
              </div>
              <div className={styles.sideValueNew}>
                {diff.memo.new.type} · {diff.memo.new.value}
              </div>
            </div>
          </div>
        )}

        <div className={styles.operationsSection}>
          <div className={styles.operationsTitle}>Operations</div>
          {diff.operations.length === 0 ? (
            <div className={styles.noChanges}>No operation changes</div>
          ) : (
            diff.operations.map((opChange, i) => (
              <div key={i} className={styles.opChange}>
                {opChange.type === 'added' && (
                  <>
                    <div className={styles.opTypeAdded}>
                      <Plus size={12} />
                      Op {opChange.index + 1}: Added
                    </div>
                    <div className={styles.sideBySide}>
                      <div className={styles.side}></div>
                      <div className={styles.side}>
                        <pre className={styles.opPre}>{JSON.stringify(opChange.operation, null, 2)}</pre>
                      </div>
                    </div>
                  </>
                )}
                {opChange.type === 'removed' && (
                  <>
                    <div className={styles.opTypeRemoved}>
                      <Minus size={12} />
                      Op {opChange.index + 1}: Removed
                    </div>
                    <div className={styles.sideBySide}>
                      <div className={styles.side}>
                        <pre className={styles.opPre}>{JSON.stringify(opChange.operation, null, 2)}</pre>
                      </div>
                      <div className={styles.side}></div>
                    </div>
                  </>
                )}
                {opChange.type === 'modified' && (
                  <>
                    <div className={styles.opTypeModified}>
                      <Edit size={12} />
                      Op {opChange.index + 1}: Modified
                    </div>
                    <div className={styles.sideBySide}>
                      <div className={styles.side}>
                        <pre className={styles.opPre}>{JSON.stringify(opChange.old, null, 2)}</pre>
                      </div>
                      <div className={styles.side}>
                        <pre className={styles.opPre}>{JSON.stringify(opChange.new, null, 2)}</pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

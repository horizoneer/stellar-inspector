import React from 'react'
import { Download } from 'lucide-react'
import { exportTransactionToCSV } from '../utils/csvExport'
import styles from './ExportButton.module.css'

export default function ExportButton({ tx }) {
  if (!tx || tx.xdr_only) return null

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function exportAsJSON() {
    const data = {
      hash: tx.hash,
      ledger: tx.ledger,
      created_at: tx.created_at,
      source_account: tx.source_account,
      fee_charged: tx.fee_charged,
      max_fee: tx.max_fee,
      successful: tx.successful,
      memo_type: tx.memo_type,
      memo: tx.memo,
      operation_count: tx.operation_count,
      operations: tx.operations,
      envelope_xdr: tx.envelope_xdr,
      result_xdr: tx.result_xdr,
    }
    
    downloadFile(
      JSON.stringify(data, null, 2),
      `transaction-${tx.hash?.slice(0, 8) || 'export'}.json`,
      'application/json'
    )
  }

  function exportAsCSV() {
    exportTransactionToCSV(tx)
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.btn} onClick={exportAsJSON}>
        <Download size={14} />
        <span>JSON</span>
      </button>
      <button className={styles.btn} onClick={exportAsCSV}>
        <Download size={14} />
        <span>CSV</span>
      </button>
    </div>
  )
}

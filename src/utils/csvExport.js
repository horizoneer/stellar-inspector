export function exportTransactionToCSV(transaction) {
  if (!transaction) return

  const headers = [
    'Hash',
    'Ledger',
    'Created At',
    'Source Account',
    'Fee Charged',
    'Max Fee',
    'Operation Count',
    'Successful',
    'Memo Type',
    'Memo',
  ]

  const rows = [[
    transaction.hash || '',
    transaction.ledger || '',
    transaction.created_at || '',
    transaction.source_account || '',
    transaction.fee_charged || '',
    transaction.max_fee || '',
    transaction.operation_count || '',
    transaction.successful ? 'Yes' : 'No',
    transaction.memo_type || '',
    transaction.memo || '',
  ]]

  // Add operation details
  if (transaction.operations && transaction.operations.length > 0) {
    rows.push([])
    rows.push(['Operations'])
    rows.push([
      'Operation ID',
      'Type',
      'Source Account',
      'Details',
    ])

    transaction.operations.forEach(op => {
      const details = Object.entries(op)
        .filter(([key]) => !['id', 'type', 'type_i', 'source_account', 'created_at'].includes(key))
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ')

      rows.push([
        op.id || '',
        op.type || '',
        op.source_account || '',
        details || '',
      ])
    })
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  downloadCSV(csvContent, `transaction-${transaction.hash || 'xdr'}.csv`)
}

export function exportAccountToCSV(account, transactions = []) {
  if (!account) return

  const headers = [
    'Account ID',
    'Balance',
    'Sequence',
    'Thresholds (Low/Med/High)',
    'Signers Count',
    'Subentries Count',
    'Last Modified',
  ]

  const rows = [[
    account.account_id || '',
    account.balances?.find(b => b.asset_type === 'native')?.balance || '',
    account.sequence || '',
    `${account.thresholds?.low_threshold || 0}/${account.thresholds?.med_threshold || 0}/${account.thresholds?.high_threshold || 0}`,
    account.signers?.length || 0,
    account.subentry_count || 0,
    account.last_modified_ledger || '',
  ]]

  // Add trustlines
  if (account.balances && account.balances.length > 1) {
    rows.push([])
    rows.push(['Trustlines'])
    rows.push([
      'Asset Type',
      'Asset Code',
      'Issuer',
      'Balance',
      'Limit',
    ])

    account.balances
      .filter(b => b.asset_type !== 'native')
      .forEach(balance => {
        rows.push([
          balance.asset_type || '',
          balance.asset_code || '',
          balance.asset_issuer || '',
          balance.balance || '',
          balance.limit || '',
        ])
      })
  }

  // Add recent transactions
  if (transactions && transactions.length > 0) {
    rows.push([])
    rows.push(['Recent Transactions'])
    rows.push([
      'Hash',
      'Created At',
      'Operation Count',
      'Successful',
      'Memo',
    ])

    transactions.forEach(tx => {
      rows.push([
        tx.hash || '',
        tx.created_at || '',
        tx.operation_count || '',
        tx.successful ? 'Yes' : 'No',
        tx.memo || '',
      ])
    })
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  downloadCSV(csvContent, `account-${account.account_id || 'unknown'}.csv`)
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

import React from 'react'
import { Filter } from 'lucide-react'
import styles from './OperationFilter.module.css'

const OPERATION_TYPES = [
  { value: 'all', label: 'All Operations' },
  { value: 'payment', label: 'Payment' },
  { value: 'create_account', label: 'Create Account' },
  { value: 'change_trust', label: 'Change Trust' },
  { value: 'manage_sell_offer', label: 'Manage Sell Offer' },
  { value: 'manage_buy_offer', label: 'Manage Buy Offer' },
  { value: 'path_payment_strict_send', label: 'Path Payment (Send)' },
  { value: 'path_payment_strict_receive', label: 'Path Payment (Receive)' },
  { value: 'set_options', label: 'Set Options' },
  { value: 'account_merge', label: 'Account Merge' },
  { value: 'manage_data', label: 'Manage Data' },
  { value: 'bump_sequence', label: 'Bump Sequence' },
  { value: 'create_passive_sell_offer', label: 'Create Passive Offer' },
  { value: 'invoke_host_function', label: 'Invoke Host Function' },
  { value: 'liquidity_pool_deposit', label: 'Liquidity Pool Deposit' },
  { value: 'liquidity_pool_withdraw', label: 'Liquidity Pool Withdraw' },
  { value: 'create_claimable_balance', label: 'Create Claimable Balance' },
  { value: 'claim_claimable_balance', label: 'Claim Balance' },
  { value: 'clawback', label: 'Clawback' },
  { value: 'set_trust_line_flags', label: 'Set Trustline Flags' },
]

export default function OperationFilter({ value, onChange, operations }) {
  // Get unique operation types from current transaction
  const availableTypes = operations?.length > 0
    ? [...new Set(operations.map(op => op.type))]
    : []

  if (availableTypes.length === 0) return null

  const filteredCount = value === 'all' 
    ? operations.length 
    : operations.filter(op => op.type === value).length

  return (
    <div className={styles.wrap}>
      <Filter size={14} className={styles.icon} />
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter operations by type"
      >
        <option value="all">All Operations ({operations.length})</option>
        {availableTypes.map(type => {
          const count = operations.filter(op => op.type === type).length
          const label = OPERATION_TYPES.find(t => t.value === type)?.label || type
          return (
            <option key={type} value={type}>
              {label} ({count})
            </option>
          )
        })}
      </select>
    </div>
  )
}

export const OPERATION_TYPES_LIST = OPERATION_TYPES

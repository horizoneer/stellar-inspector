import React, { useState } from 'react'
import { useNetwork } from '../context/NetworkContext'
import { fetchAccount, fetchAccountTransactions } from '../utils/stellar'
import CopyButton from '../components/CopyButton'
import styles from './ComparePage.module.css'

export default function ComparePage() {
  const { config } = useNetwork()
  const [addresses, setAddresses] = useState(['', '', ''])
  const [accounts, setAccounts] = useState([null, null, null])
  const [transactions, setTransactions] = useState([[], [], []])
  const [loading, setLoading] = useState([false, false, false])
  const [errors, setErrors] = useState([null, null, null])

  const handleAddressChange = (index, value) => {
    const newAddresses = [...addresses]
    newAddresses[index] = value
    setAddresses(newAddresses)
  }

  const handleLoadAccount = async (index) => {
    const address = addresses[index]?.trim()
    if (!address) return

    const newLoading = [...loading]
    newLoading[index] = true
    setLoading(newLoading)

    const newErrors = [...errors]
    newErrors[index] = null
    setErrors(newErrors)

    try {
      const accountData = await fetchAccount(address)
      const newAccounts = [...accounts]
      newAccounts[index] = accountData
      setAccounts(newAccounts)

      const txData = await fetchAccountTransactions(address, 5)
      const newTransactions = [...transactions]
      newTransactions[index] = txData.records
      setTransactions(newTransactions)
    } catch (err) {
      const newErrors = [...errors]
      newErrors[index] = err.message
      setErrors(newErrors)
    } finally {
      const newLoading = [...loading]
      newLoading[index] = false
      setLoading(newLoading)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Multi-Account Comparison</h1>
        <p>Compare up to 3 Stellar accounts side by side</p>
      </div>

      <div className={styles.grid}>
        {[0, 1, 2].map((index) => (
          <div key={index} className={styles.column}>
            <div className={styles.addressRow}>
              <input
                type="text"
                value={addresses[index]}
                onChange={(e) => handleAddressChange(index, e.target.value)}
                placeholder={`Account ${index + 1} address`}
                className={styles.input}
              />
              <button
                onClick={() => handleLoadAccount(index)}
                disabled={loading[index] || !addresses[index].trim()}
                className={styles.loadButton}
              >
                {loading[index] ? '...' : 'Load'}
              </button>
            </div>

            {errors[index] && <div className={styles.error}>{errors[index]}</div>}

            {accounts[index] && (
              <div className={styles.accountCard}>
                <div className={styles.cardHeader}>
                  <h3>Account {index + 1}</h3>
                  <CopyButton text={accounts[index].id} />
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.label}>Sequence:</span>
                  <span className={styles.value}>{accounts[index].sequence}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.label}>Subentries:</span>
                  <span className={styles.value}>{accounts[index].subentry_count}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.label}>Signers:</span>
                  <span className={styles.value}>{accounts[index].signers?.length || 0}</span>
                </div>

                <div className={styles.section}>
                  <h4>Balances</h4>
                  <div className={styles.balances}>
                    {accounts[index].balances?.map((balance, idx) => (
                      <div key={idx} className={styles.balance}>
                        <span>{balance.asset_type === 'native' ? 'XLM' : `${balance.asset_code}`}</span>
                        <span>{balance.balance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.section}>
                  <h4>Recent Transactions</h4>
                  <div className={styles.txList}>
                    {transactions[index].map((tx) => (
                      <a
                        key={tx.hash}
                        href={`/tx/${tx.hash}`}
                        className={styles.txItem}
                      >
                        <span>{tx.hash.slice(0, 8)}...</span>
                        <span>{tx.successful ? '✓' : '✗'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

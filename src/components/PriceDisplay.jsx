import React, { useState, useEffect } from 'react'
import { DollarSign, RefreshCw, AlertCircle } from 'lucide-react'
import { fetchXLMPrice, formatPrice } from '../utils/priceApi'
import styles from './PriceDisplay.module.css'

export default function PriceDisplay() {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPrice()
  }, [])

  async function loadPrice() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchXLMPrice()
      setPriceData(data)
    } catch (err) {
      setError('Failed to load price')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.priceDisplay}>
        <RefreshCw size={16} className={styles.spin} />
        <span>Loading price...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.priceDisplay}>
        <AlertCircle size={16} className={styles.errorIcon} />
        <span className={styles.error}>{error}</span>
        <button className={styles.retryButton} onClick={loadPrice}>
          Retry
        </button>
      </div>
    )
  }

  if (!priceData) {
    return null
  }

  return (
    <div className={styles.priceDisplay}>
      <DollarSign size={16} className={styles.icon} />
      <div className={styles.priceInfo}>
        <span className={styles.priceLabel}>XLM Price</span>
        <div className={styles.priceValues}>
          <span className={styles.price}>{formatPrice(priceData, 'USD')}</span>
          <span className={styles.secondaryPrice}>{formatPrice(priceData, 'EUR')}</span>
        </div>
      </div>
      <button 
        className={styles.refreshButton}
        onClick={loadPrice}
        title="Refresh price"
      >
        <RefreshCw size={14} />
      </button>
    </div>
  )
}

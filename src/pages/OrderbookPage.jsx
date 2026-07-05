import React, { useState } from 'react'
import { Search, Loader2, AlertCircle, BarChart2 } from 'lucide-react'
import { useNetwork } from '../context/NetworkContext'
import { fetchOrderbook, setHorizonUrl } from '../utils/stellar'
import styles from './OrderbookPage.module.css'

export default function OrderbookPage() {
  const { config } = useNetwork()
  const [sellingType, setSellingType] = useState('native')
  const [sellingCode, setSellingCode] = useState('')
  const [sellingIssuer, setSellingIssuer] = useState('')
  const [buyingType, setBuyingType] = useState('credit_alphanum4')
  const [buyingCode, setBuyingCode] = useState('USD')
  const [buyingIssuer, setBuyingIssuer] = useState('GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX')
  const [orderbook, setOrderbook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFetchOrderbook = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setHorizonUrl(config.horizonUrl)
    try {
      const data = await fetchOrderbook(
        sellingType,
        sellingType === 'native' ? '' : sellingCode,
        sellingType === 'native' ? '' : sellingIssuer,
        buyingType,
        buyingType === 'native' ? '' : buyingCode,
        buyingType === 'native' ? '' : buyingIssuer
      )
      setOrderbook(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BarChart2 size={18} strokeWidth={1.5} />
        <h1 className={styles.title}>Orderbook</h1>
      </div>

      <form className={styles.form} onSubmit={handleFetchOrderbook}>
        <div className={styles.assetSection}>
          <h3 className={styles.assetSectionTitle}>Selling</h3>
          <div className={styles.assetInputs}>
            <select
              value={sellingType}
              onChange={(e) => setSellingType(e.target.value)}
              className={styles.assetTypeSelect}
            >
              <option value="native">XLM (Native)</option>
              <option value="credit_alphanum4">Credit (4)</option>
              <option value="credit_alphanum12">Credit (12)</option>
            </select>
            {sellingType !== 'native' && (
              <>
                <input
                  type="text"
                  placeholder="Asset Code"
                  value={sellingCode}
                  onChange={(e) => setSellingCode(e.target.value)}
                  className={styles.assetInput}
                />
                <input
                  type="text"
                  placeholder="Asset Issuer"
                  value={sellingIssuer}
                  onChange={(e) => setSellingIssuer(e.target.value)}
                  className={styles.assetInput}
                />
              </>
            )}
          </div>
        </div>

        <div className={styles.assetSection}>
          <h3 className={styles.assetSectionTitle}>Buying</h3>
          <div className={styles.assetInputs}>
            <select
              value={buyingType}
              onChange={(e) => setBuyingType(e.target.value)}
              className={styles.assetTypeSelect}
            >
              <option value="native">XLM (Native)</option>
              <option value="credit_alphanum4">Credit (4)</option>
              <option value="credit_alphanum12">Credit (12)</option>
            </select>
            {buyingType !== 'native' && (
              <>
                <input
                  type="text"
                  placeholder="Asset Code"
                  value={buyingCode}
                  onChange={(e) => setBuyingCode(e.target.value)}
                  className={styles.assetInput}
                />
                <input
                  type="text"
                  placeholder="Asset Issuer"
                  value={buyingIssuer}
                  onChange={(e) => setBuyingIssuer(e.target.value)}
                  className={styles.assetInput}
                />
              </>
            )}
          </div>
        </div>

        <button type="submit" className={styles.fetchBtn} disabled={loading}>
          {loading ? <Loader2 size={14} className={styles.spin} /> : 'Fetch Orderbook'}
        </button>
      </form>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {orderbook && (
        <div className={styles.orderbookContainer}>
          <div className={styles.orderbookSection}>
            <h3 className={styles.orderbookSectionTitle}>Bids</h3>
            <div className={styles.orderbookHeaderRow}>
              <span className={styles.orderbookCol}>Price</span>
              <span className={styles.orderbookCol}>Amount</span>
            </div>
            <div className={styles.orderbookRows}>
              {orderbook.bids?.map((bid, i) => (
                <div key={i} className={styles.orderbookRow}>
                  <span className={styles.orderbookCol}>{bid.price}</span>
                  <span className={styles.orderbookCol}>{bid.amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.orderbookSection}>
            <h3 className={styles.orderbookSectionTitle}>Asks</h3>
            <div className={styles.orderbookHeaderRow}>
              <span className={styles.orderbookCol}>Price</span>
              <span className={styles.orderbookCol}>Amount</span>
            </div>
            <div className={styles.orderbookRows}>
              {orderbook.asks?.map((ask, i) => (
                <div key={i} className={styles.orderbookRow}>
                  <span className={styles.orderbookCol}>{ask.price}</span>
                  <span className={styles.orderbookCol}>{ask.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

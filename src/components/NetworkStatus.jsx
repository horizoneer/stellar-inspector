import React, { useState, useEffect } from 'react'
import { useNetwork } from '../context/NetworkContext'
import { Activity, Wifi, WifiOff } from 'lucide-react'
import styles from './NetworkStatus.module.css'

export default function NetworkStatus() {
  const { config } = useNetwork()
  const [status, setStatus] = useState('checking') // checking, online, offline
  const [latestLedger, setLatestLedger] = useState(null)

  useEffect(() => {
    let mounted = true
    let interval

    async function checkStatus() {
      try {
        const res = await fetch(`${config.horizonUrl}`)
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        if (mounted) {
          setStatus('online')
          setLatestLedger(data.core_latest_ledger)
        }
      } catch {
        if (mounted) {
          setStatus('offline')
          setLatestLedger(null)
        }
      }
    }

    checkStatus()
    interval = setInterval(checkStatus, 30000) // Check every 30s

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [config.horizonUrl])

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {status === 'checking' && (
          <>
            <Activity size={12} className={styles.spin} />
            <span className={styles.text}>Checking network...</span>
          </>
        )}
        {status === 'online' && (
          <>
            <Wifi size={12} className={styles.online} />
            <span className={styles.text}>
              {latestLedger && `Ledger #${latestLedger.toLocaleString()}`}
            </span>
          </>
        )}
        {status === 'offline' && (
          <>
            <WifiOff size={12} className={styles.offline} />
            <span className={styles.text}>Network offline</span>
          </>
        )}
      </div>
    </div>
  )
}

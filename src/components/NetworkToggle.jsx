import React from 'react'
import { useNetwork } from '../context/NetworkContext'
import { Globe } from 'lucide-react'
import styles from './NetworkToggle.module.css'

export default function NetworkToggle() {
  const { network, setNetwork, networks } = useNetwork()

  return (
    <div className={styles.wrap}>
      <Globe size={14} strokeWidth={1.5} className={styles.icon} />
      <select
        className={styles.select}
        value={network}
        onChange={(e) => setNetwork(e.target.value)}
        aria-label="Select network"
      >
        {Object.entries(networks).map(([key, net]) => (
          <option key={key} value={key}>
            {net.label}
          </option>
        ))}
      </select>
      <span
        className={styles.indicator}
        style={{ backgroundColor: networks[network].color }}
      />
    </div>
  )
}

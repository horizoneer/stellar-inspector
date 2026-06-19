import React, { createContext, useContext, useState, useEffect } from 'react'

const NetworkContext = createContext(null)

const NETWORKS = {
  testnet: {
    name: 'Testnet',
    horizonUrl: 'https://horizon-testnet.stellar.org',
    label: 'Testnet',
    color: 'var(--color-warning)'
  },
  mainnet: {
    name: 'Mainnet',
    horizonUrl: 'https://horizon.stellar.org',
    label: 'Mainnet',
    color: 'var(--color-success)'
  }
}

export function NetworkProvider({ children }) {
  const [network, setNetwork] = useState(() => {
    const saved = localStorage.getItem('stellar-network')
    return saved === 'mainnet' ? 'mainnet' : 'testnet'
  })

  useEffect(() => {
    localStorage.setItem('stellar-network', network)
  }, [network])

  const value = {
    network,
    setNetwork,
    config: NETWORKS[network],
    networks: NETWORKS
  }

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  )
}

export function useNetwork() {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider')
  }
  return context
}

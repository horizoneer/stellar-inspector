import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NetworkProvider } from './context/NetworkContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import InspectorPage from './pages/InspectorPage'
import AccountPage from './pages/AccountPage'
import LedgerPage from './pages/LedgerPage'
import ClaimablePage from './pages/ClaimablePage'
import OrderbookPage from './pages/OrderbookPage'
import StatsPage from './pages/StatsPage'
import ContractPage from './pages/ContractPage'
import ComparePage from './pages/ComparePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NetworkProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<InspectorPage />} />
              <Route path="tx/:hash" element={<InspectorPage />} />
              <Route path="account/:address" element={<AccountPage />} />
              <Route path="ledger" element={<LedgerPage />} />
              <Route path="claimable" element={<ClaimablePage />} />
              <Route path="orderbook" element={<OrderbookPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="contract" element={<ContractPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </NetworkProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

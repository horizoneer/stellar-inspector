import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NetworkProvider } from './context/NetworkContext'
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import Layout from './components/Layout'
import LoadingSkeleton from './components/LoadingSkeleton'

const InspectorPage = lazy(() => import('./pages/InspectorPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const LedgerPage = lazy(() => import('./pages/LedgerPage'))
const ClaimablePage = lazy(() => import('./pages/ClaimablePage'))
const OrderbookPage = lazy(() => import('./pages/OrderbookPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const ContractPage = lazy(() => import('./pages/ContractPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageLoader() {
  return (
    <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
      <LoadingSkeleton variant="rect" width="100%" height="200px" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <NetworkProvider>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
            <KeyboardShortcuts />
          </NetworkProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

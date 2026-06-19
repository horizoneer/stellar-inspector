import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NetworkProvider } from './context/NetworkContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import InspectorPage from './pages/InspectorPage'
import AccountPage from './pages/AccountPage'
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
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </NetworkProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

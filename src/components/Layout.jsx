import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Telescope, Github, ExternalLink } from 'lucide-react'
import NetworkToggle from './NetworkToggle'
import ThemeToggle from './ThemeToggle'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/" className={styles.logo}>
            <Telescope size={18} strokeWidth={1.5} />
            <span>stellar<strong>inspector</strong></span>
          </NavLink>

          <nav className={styles.nav}>
            <NavLink to="/" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink} end>
              Transactions
            </NavLink>
            <NavLink to="/ledger" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
              Ledger
            </NavLink>
            <NavLink to="/claimable" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
              Claimable
            </NavLink>
            <NavLink to="/orderbook" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
              Orderbook
            </NavLink>
            <NavLink to="/stats" className={({ isActive }) => isActive ? styles.navLinkActive : styles.navLink}>
              Stats
            </NavLink>
          </nav>

          <div className={styles.headerRight}>
            <ThemeToggle />
            <NetworkToggle />
            <a
              href="https://github.com/horizoneer/stellar-inspector"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconLink}
              aria-label="GitHub repository"
            >
              <Github size={16} strokeWidth={1.5} />
            </a>
            <a
              href="https://horizon.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconLink}
              aria-label="Stellar Horizon API"
            >
              <ExternalLink size={16} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>
          Built by <a href="https://github.com/horizoneer" target="_blank" rel="noopener noreferrer">Horizoneer</a>
          {' '}· Open source · <a href="https://github.com/horizoneer/stellar-inspector/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contribute</a>
        </p>
      </footer>
    </div>
  )
}

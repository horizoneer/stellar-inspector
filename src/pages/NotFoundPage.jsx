import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>404</p>
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Page not found</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>This page doesn&apos;t exist.</p>
      <Link to="/" style={{ color: 'var(--color-accent)', fontSize: 14 }}>← Back to inspector</Link>
    </div>
  )
}

import React from 'react'
import { useParams } from 'react-router-dom'

export default function AccountPage() {
  const { address } = useParams()
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Account</h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>{address}</p>
      <p style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>Account detail view — coming soon. Contributions welcome!</p>
    </div>
  )
}

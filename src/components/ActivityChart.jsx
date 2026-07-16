import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import styles from './ActivityChart.module.css'

export default function ActivityChart({ transactions, type = 'line' }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No transaction data available for chart</p>
      </div>
    )
  }

  // Process transactions for chart data
  const chartData = transactions
    .map(tx => ({
      date: new Date(tx.created_at).toLocaleDateString(),
      timestamp: new Date(tx.created_at).getTime(),
      fee: parseFloat(tx.fee_charged) / 1e7,
      operations: tx.operation_count,
      successful: tx.successful ? 1 : 0,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-30) // Show last 30 transactions

  // Aggregate by date for better visualization
  const aggregatedData = chartData.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date)
    if (existing) {
      existing.fee += curr.fee
      existing.operations += curr.operations
      existing.successful += curr.successful
      existing.count += 1
    } else {
      acc.push({
        date: curr.date,
        fee: curr.fee,
        operations: curr.operations,
        successful: curr.successful,
        count: 1,
      })
    }
    return acc
  }, [])

  if (type === 'line') {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.title}>Transaction Fees Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickFormatter={(value) => value.toFixed(4)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
              }}
              formatter={(value) => [value.toFixed(7) + ' XLM', 'Fee']}
            />
            <Line 
              type="monotone" 
              dataKey="fee" 
              stroke="var(--color-primary)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === 'bar') {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.title}>Operations per Transaction</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
              }}
            />
            <Bar 
              dataKey="operations" 
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}

import React from 'react'
import styles from './LoadingSkeleton.module.css'

export default function LoadingSkeleton({ className, variant = 'default', width, height, count = 1 }) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${styles.skeleton} ${styles[variant]} ${className || ''}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  ))

  return count === 1 ? skeletons[0] : <div className={styles.skeletonGroup}>{skeletons}</div>
}

export function TransactionSkeleton() {
  return (
    <div className={styles.transactionSkeleton}>
      <div className={styles.skeletonHeader}>
        <LoadingSkeleton variant="text" width="200px" height="24px" />
        <LoadingSkeleton variant="text" width="120px" height="16px" />
      </div>
      <div className={styles.skeletonFields}>
        <LoadingSkeleton variant="text" width="100%" height="16px" />
        <LoadingSkeleton variant="text" width="80%" height="16px" />
        <LoadingSkeleton variant="text" width="60%" height="16px" />
      </div>
      <div className={styles.skeletonOperations}>
        <LoadingSkeleton variant="text" width="150px" height="20px" />
        <LoadingSkeleton variant="rect" width="100%" height="60px" />
      </div>
    </div>
  )
}

export function AccountSkeleton() {
  return (
    <div className={styles.accountSkeleton}>
      <div className={styles.skeletonHeader}>
        <LoadingSkeleton variant="circle" width="48px" height="48px" />
        <div className={styles.skeletonHeaderInfo}>
          <LoadingSkeleton variant="text" width="200px" height="20px" />
          <LoadingSkeleton variant="text" width="150px" height="16px" />
        </div>
      </div>
      <div className={styles.skeletonBalance}>
        <LoadingSkeleton variant="text" width="100px" height="16px" />
        <LoadingSkeleton variant="text" width="180px" height="32px" />
      </div>
      <div className={styles.skeletonTrustlines}>
        <LoadingSkeleton variant="text" width="120px" height="18px" />
        <LoadingSkeleton variant="rect" width="100%" height="40px" count={3} />
      </div>
    </div>
  )
}

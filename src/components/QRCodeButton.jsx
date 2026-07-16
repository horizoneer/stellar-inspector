import React, { useState } from 'react'
import { QrCode, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './QRCodeButton.module.css'

export default function QRCodeButton({ value, label }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!value) return null

  return (
    <>
      <button
        className={styles.qrButton}
        onClick={() => setIsOpen(true)}
        aria-label="Show QR code"
        title="Show QR code"
      >
        <QrCode size={14} />
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <h3 className={styles.title}>{label || 'QR Code'}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.content}>
              <div className={styles.qrContainer}>
                <QRCodeSVG
                  value={value}
                  size={256}
                  level="M"
                  includeMargin={true}
                  className={styles.qrCode}
                />
              </div>
              <p className={styles.value}>{value}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

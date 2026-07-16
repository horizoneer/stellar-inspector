import { describe, it, expect } from 'vitest'
import { exportTransactionToCSV, exportAccountToCSV } from '../../utils/csvExport'

describe('csvExport', () => {
  describe('exportTransactionToCSV', () => {
    it('should handle null transaction', () => {
      expect(() => exportTransactionToCSV(null)).not.toThrow()
    })

    it('should handle transaction with operations', () => {
      const tx = {
        hash: 'abc123',
        ledger: 12345,
        created_at: '2024-01-01T00:00:00Z',
        source_account: 'GABC123',
        fee_charged: 100,
        max_fee: 100,
        operation_count: 1,
        successful: true,
        memo_type: 'text',
        memo: 'test',
        operations: [
          { id: '1', type: 'payment', amount: '100' }
        ]
      }
      
      expect(() => exportTransactionToCSV(tx)).not.toThrow()
    })
  })

  describe('exportAccountToCSV', () => {
    it('should handle null account', () => {
      expect(() => exportAccountToCSV(null)).not.toThrow()
    })

    it('should handle account with balances', () => {
      const account = {
        account_id: 'GABC123',
        sequence: '123456',
        balances: [
          { asset_type: 'native', balance: '1000' },
          { asset_type: 'credit_alphanum4', asset_code: 'USD', asset_issuer: 'GXYZ789', balance: '500' }
        ],
        thresholds: { low_threshold: 1, med_threshold: 2, high_threshold: 3 },
        signers: [{ key: 'GABC123', weight: 1 }],
        subentry_count: 0,
        last_modified_ledger: 12345
      }
      
      expect(() => exportAccountToCSV(account)).not.toThrow()
    })
  })
})

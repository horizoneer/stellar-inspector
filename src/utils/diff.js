export function diffTransactions(tx1, tx2) {
  const changes = {}

  if (tx1.source_account !== tx2.source_account) {
    changes.source_account = {
      old: tx1.source_account,
      new: tx2.source_account
    }
  }

  if (tx1.fee_charged !== tx2.fee_charged) {
    changes.fee_charged = {
      old: tx1.fee_charged,
      new: tx2.fee_charged
    }
  }

  if (tx1.max_fee !== tx2.max_fee) {
    changes.max_fee = {
      old: tx1.max_fee,
      new: tx2.max_fee
    }
  }

  if (tx1.memo !== tx2.memo || tx1.memo_type !== tx2.memo_type) {
    changes.memo = {
      old: { type: tx1.memo_type, value: tx1.memo },
      new: { type: tx2.memo_type, value: tx2.memo }
    }
  }

  changes.operations = diffOperations(tx1.operations, tx2.operations)

  return changes
}

function diffOperations(ops1, ops2) {
  const changes = []
  const maxLen = Math.max(ops1.length, ops2.length)

  for (let i = 0; i < maxLen; i++) {
    const op1 = ops1[i]
    const op2 = ops2[i]

    if (!op1) {
      changes.push({ type: 'added', index: i, operation: op2 })
    } else if (!op2) {
      changes.push({ type: 'removed', index: i, operation: op1 })
    } else {
      const opChanges = diffOperation(op1, op2)
      if (Object.keys(opChanges).length > 0) {
        changes.push({ type: 'modified', index: i, changes: opChanges, old: op1, new: op2 })
      }
    }
  }

  return changes
}

function diffOperation(op1, op2) {
  const changes = {}
  const allKeys = new Set([...Object.keys(op1), ...Object.keys(op2)])

  for (const key of allKeys) {
    if (op1[key] !== op2[key]) {
      changes[key] = { old: op1[key], new: op2[key] }
    }
  }

  return changes
}

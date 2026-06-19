const HORIZON_URL = 'https://horizon-testnet.stellar.org'

export async function fetchTransaction(hashOrXdr) {
  const isXdr = hashOrXdr.length > 64

  if (isXdr) {
    return decodeXdr(hashOrXdr)
  }

  const res = await fetch(`${HORIZON_URL}/transactions/${hashOrXdr}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Transaction not found (${res.status})`)
  }

  const tx = await res.json()
  const opsRes = await fetch(`${HORIZON_URL}/transactions/${hashOrXdr}/operations`)
  const opsData = opsRes.ok ? await opsRes.json() : { _embedded: { records: [] } }

  return normalise(tx, opsData._embedded.records)
}

export async function fetchAccount(address) {
  const res = await fetch(`${HORIZON_URL}/accounts/${address}`)
  if (!res.ok) throw new Error(`Account not found (${res.status})`)
  return res.json()
}

function normalise(tx, ops) {
  return {
    hash: tx.hash,
    ledger: tx.ledger,
    created_at: tx.created_at,
    source_account: tx.source_account,
    fee_charged: tx.fee_charged,
    max_fee: tx.max_fee,
    operation_count: tx.operation_count,
    successful: tx.successful,
    memo_type: tx.memo_type,
    memo: tx.memo || null,
    envelope_xdr: tx.envelope_xdr,
    result_xdr: tx.result_xdr,
    operations: ops.map(normaliseOp),
    raw: tx,
  }
}

function normaliseOp(op) {
  const base = {
    id: op.id,
    type: op.type,
    type_i: op.type_i,
    source_account: op.source_account,
    created_at: op.created_at,
  }

  switch (op.type) {
    case 'payment':
      return { ...base, to: op.to, from: op.from, asset: formatAsset(op.asset_type, op.asset_code, op.asset_issuer), amount: op.amount }
    case 'create_account':
      return { ...base, account: op.account, funder: op.funder, starting_balance: op.starting_balance }
    case 'change_trust':
      return { ...base, asset: formatAsset(op.asset_type, op.asset_code, op.asset_issuer), limit: op.limit, trustor: op.trustor }
    case 'manage_sell_offer':
    case 'manage_buy_offer':
      return { ...base, selling: formatAsset(op.selling_asset_type, op.selling_asset_code, op.selling_asset_issuer), buying: formatAsset(op.buying_asset_type, op.buying_asset_code, op.buying_asset_issuer), amount: op.amount, price: op.price, offer_id: op.offer_id }
    case 'path_payment_strict_send':
    case 'path_payment_strict_receive':
      return { ...base, from: op.from, to: op.to, asset_sent: formatAsset(op.asset_type, op.asset_code, op.asset_issuer), amount: op.amount, destination_asset: formatAsset(op.destination_asset_type, op.destination_asset_code, op.destination_asset_issuer), destination_amount: op.destination_amount }
    default:
      return { ...base, ...op }
  }
}

function formatAsset(type, code, issuer) {
  if (type === 'native') return 'XLM (native)'
  return `${code}${issuer ? ` · ${issuer.slice(0, 6)}…${issuer.slice(-4)}` : ''}`
}

function decodeXdr(xdr) {
  return {
    hash: null,
    ledger: null,
    created_at: null,
    source_account: null,
    fee_charged: null,
    max_fee: null,
    operation_count: null,
    successful: null,
    memo_type: 'none',
    memo: null,
    envelope_xdr: xdr,
    result_xdr: null,
    operations: [],
    raw: { envelope_xdr: xdr },
    xdr_only: true,
  }
}

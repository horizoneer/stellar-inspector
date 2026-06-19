import * as StellarSdk from 'stellar-sdk'

let HORIZON_URL = 'https://horizon-testnet.stellar.org'

export function setHorizonUrl(url) {
  HORIZON_URL = url
}

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

export async function fetchAccountTransactions(address, limit = 10) {
  const res = await fetch(`${HORIZON_URL}/accounts/${address}/transactions?limit=${limit}&order=desc`)
  if (!res.ok) throw new Error(`Failed to fetch transactions (${res.status})`)
  const data = await res.json()
  return data._embedded.records
}

function decodeMemo(memoType, memo) {
  if (!memo) return null

  if (memoType === 'memo_hash' || memoType === 'memo_return') {
    // Try to decode from hex to UTF-8
    try {
      const buffer = Buffer.from(memo, 'hex')
      const text = buffer.toString('utf8')
      // Check if it's valid UTF-8 text
      const reencoded = Buffer.from(text, 'utf8').toString('hex')
      if (reencoded === memo.toLowerCase()) {
        return text
      }
    } catch {
      // Fallback to original hex
    }
  }

  return memo
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
    memo: decodeMemo(tx.memo_type, tx.memo),
    memo_raw: tx.memo || null,
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
    case 'invoke_host_function':
      return {
        ...base,
        function: op.function?.replace('HostFunctionTypeHostFunctionType', '') || 'InvokeContract',
        parameters: op.parameters ? `${op.parameters.length} parameter(s)` : 'none',
        source_account: op.source_account,
      }
    case 'set_options':
      return {
        ...base,
        signer: op.signer ? `${op.signer.key?.slice(0, 8)}... (weight: ${op.signer.weight})` : null,
        master_weight: op.master_weight,
        low_threshold: op.low_threshold,
        med_threshold: op.med_threshold,
        high_threshold: op.high_threshold,
        home_domain: op.home_domain,
        inflation_dest: op.inflation_dest,
        clear_flags: op.clear_flags,
        set_flags: op.set_flags,
      }
    case 'account_merge':
      return { ...base, account: op.account, into: op.into }
    case 'manage_data':
      return { ...base, name: op.name, value: op.value }
    case 'bump_sequence':
      return { ...base, bump_to: op.bump_to }
    case 'create_passive_sell_offer':
      return {
        ...base,
        selling: formatAsset(op.selling_asset_type, op.selling_asset_code, op.selling_asset_issuer),
        buying: formatAsset(op.buying_asset_type, op.buying_asset_code, op.buying_asset_issuer),
        amount: op.amount,
        price: op.price,
      }
    case 'liquidity_pool_deposit':
      return {
        ...base,
        pool_id: op.liquidity_pool_id,
        max_amount_a: op.max_amount_a,
        max_amount_b: op.max_amount_b,
        min_price: op.min_price,
        max_price: op.max_price,
      }
    case 'liquidity_pool_withdraw':
      return {
        ...base,
        pool_id: op.liquidity_pool_id,
        amount: op.amount,
        min_amount_a: op.min_amount_a,
        min_amount_b: op.min_amount_b,
      }
    case 'create_claimable_balance':
      return {
        ...base,
        asset: formatAsset(op.asset_type, op.asset_code, op.asset_issuer),
        amount: op.amount,
        claimants: op.claimants?.length || 0,
      }
    case 'claim_claimable_balance':
      return {
        ...base,
        balance_id: op.balance_id,
        claimant: op.claimant,
      }
    case 'clawback':
      return {
        ...base,
        asset: formatAsset(op.asset_type, op.asset_code, op.asset_issuer),
        from: op.from,
        amount: op.amount,
      }
    case 'clawback_claimable_balance':
      return {
        ...base,
        balance_id: op.balance_id,
      }
    case 'set_trust_line_flags':
      return {
        ...base,
        asset: formatAsset(op.asset_type, op.asset_code, op.asset_issuer),
        trustor: op.trustor,
        clear_flags: op.clear_flags,
        set_flags: op.set_flags,
      }
    case 'extend_footprint_ttl':
      return {
        ...base,
        extend_to: op.extend_to,
      }
    case 'restore_footprint':
      return {
        ...base,
      }
    default:
      return { ...base, ...op }
  }
}

function formatAsset(type, code, issuer) {
  if (type === 'native') return 'XLM (native)'
  return `${code}${issuer ? ` · ${issuer.slice(0, 6)}…${issuer.slice(-4)}` : ''}`
}

function decodeXdr(xdr) {
  try {
    const transaction = StellarSdk.TransactionBuilder.fromXDR(xdr, StellarSdk.Networks.PUBLIC) || 
                        StellarSdk.TransactionBuilder.fromXDR(xdr, StellarSdk.Networks.TESTNET)
    
    const operations = transaction.operations.map((op, i) => {
      const opData = {
        id: `xdr-${i}`,
        type: op.type,
        source_account: op.source || transaction.source,
      }

      // Extract operation-specific fields
      if (op.destination) opData.destination = op.destination
      if (op.amount) opData.amount = op.amount
      if (op.asset) opData.asset = formatAssetFromOp(op.asset)
      if (op.sendAsset) opData.send_asset = formatAssetFromOp(op.sendAsset)
      if (op.destAsset) opData.dest_asset = formatAssetFromOp(op.destAsset)
      if (op.sendMax) opData.send_max = op.sendMax
      if (op.destAmount) opData.dest_amount = opData.destAmount
      if (op.startingBalance) opData.starting_balance = op.startingBalance
      if (op.trustor) opData.trustor = op.trustor
      if (op.trustee) opData.trustee = op.trustee
      if (op.line) opData.line = formatAssetFromOp(op.line)
      if (op.limit) opData.limit = op.limit
      if (op.selling) opData.selling = formatAssetFromOp(op.selling)
      if (op.buying) opData.buying = formatAssetFromOp(op.buying)
      if (op.price) opData.price = op.price
      if (op.offerId) opData.offer_id = op.offerId
      if (op.path && op.path.length > 0) opData.path = op.path.map(formatAssetFromOp)
      if (op.signer) {
        opData.signer_key = op.signer.ed25519PublicKey || op.signer.sha256Hash || op.signer.preAuthTx
        opData.signer_weight = op.signer.weight
      }
      if (op.masterWeight !== undefined) opData.master_weight = op.masterWeight
      if (op.lowThreshold !== undefined) opData.low_threshold = op.lowThreshold
      if (op.medThreshold !== undefined) opData.med_threshold = op.medThreshold
      if (op.highThreshold !== undefined) opData.high_threshold = op.highThreshold
      if (op.homeDomain) opData.home_domain = op.homeDomain
      if (op.inflationDest) opData.inflation_dest = op.inflationDest
      if (op.clearFlags) opData.clear_flags = op.clearFlags
      if (op.setFlags) opData.set_flags = op.setFlags
      if (op.dataName) opData.data_name = op.dataName
      if (op.dataValue) opData.data_value = op.dataValue

      return opData
    })

    const memo = transaction.memo
    let memoType = 'none'
    let memoValue = null
    if (memo) {
      memoType = memo.type.toLowerCase().replace('memo', '')
      memoValue = memo.value
    }

    return {
      hash: null,
      ledger: null,
      created_at: null,
      source_account: transaction.source,
      fee_charged: transaction.fee,
      max_fee: transaction.fee,
      operation_count: operations.length,
      successful: null,
      memo_type: memoType,
      memo: memoValue,
      envelope_xdr: xdr,
      result_xdr: null,
      operations,
      raw: { 
        envelope_xdr: xdr,
        source: transaction.source,
        fee: transaction.fee,
        sequence: transaction.sequence,
        memo_type: memoType,
        memo: memoValue
      },
      xdr_only: true,
      xdr_decoded: true,
    }
  } catch (err) {
    // If XDR parsing fails, return basic info
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
      xdr_error: err.message,
    }
  }
}

function formatAssetFromOp(asset) {
  if (!asset) return 'XLM (native)'
  if (asset.isNative()) return 'XLM (native)'
  return `${asset.getCode()}${asset.getIssuer() ? ` · ${asset.getIssuer().slice(0, 6)}…${asset.getIssuer().slice(-4)}` : ''}`
}

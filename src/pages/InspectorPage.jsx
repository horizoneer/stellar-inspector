import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2, AlertCircle, X, GitCompare, Eye, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import * as StellarSdk from 'stellar-sdk'
import { fetchTransaction, setHorizonUrl, simulateTransaction, findPaymentPaths, fetchAccount } from '../utils/stellar'
import { useNetwork } from '../context/NetworkContext'
import { useTransactionHistory } from '../hooks/useTransactionHistory'
import { useKeyboard } from '../hooks/useKeyboard'
import { useBookmarks } from '../hooks/useBookmarks'
import TransactionView from '../components/TransactionView'
import NetworkStatus from '../components/NetworkStatus'
import TransactionHistory from '../components/TransactionHistory'
import TransactionDiff from '../components/TransactionDiff'
import TransactionSearch from '../components/TransactionSearch'
import BookmarkButton from '../components/BookmarkButton'
import styles from './InspectorPage.module.css'

export default function InspectorPage() {
  const [input, setInput] = useState('')
  const [tx, setTx] = useState(null)
  const [prevTx, setPrevTx] = useState(null)
  const [showDiff, setShowDiff] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [simulateMode, setSimulateMode] = useState(false)
  const [simulationResult, setSimulationResult] = useState(null)
  const [validateMode, setValidateMode] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [loadingValidation, setLoadingValidation] = useState(false)
  // Path Payment Finder
  const [pathSourceAccount, setPathSourceAccount] = useState('')
  const [pathDestType, setPathDestType] = useState('native')
  const [pathDestCode, setPathDestCode] = useState('')
  const [pathDestIssuer, setPathDestIssuer] = useState('')
  const [pathDestAmount, setPathDestAmount] = useState('')
  const [paths, setPaths] = useState([])
  const [loadingPaths, setLoadingPaths] = useState(false)
  const [pathsError, setPathsError] = useState(null)

  const { config, network, setNetwork } = useNetwork()
  const { history, addToHistory, removeFromHistory, clearHistory } = useTransactionHistory()
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks()
  const navigate = useNavigate()
  const { hash: urlHash } = useParams()
  const inputRef = useRef(null)

  useKeyboard({
    '/': () => {
      inputRef.current?.focus()
    },
    escape: () => {
      setInput('')
      inputRef.current?.blur()
    },
    'ctrl+c': () => {
      if (tx?.hash) {
        navigator.clipboard.writeText(tx.hash)
      }
    },
    'n/t': () => {
      setNetwork(network === 'mainnet' ? 'testnet' : 'mainnet')
    }
  })

  // Handle deep-linked transaction hash from URL
  useEffect(() => {
    if (urlHash && !tx && !loading) {
      setInput(urlHash)
      handleInspect(urlHash)
    }
  }, [urlHash])

  useEffect(() => {
    setHorizonUrl(config.horizonUrl)
  }, [config.horizonUrl])

  async function handleInspect(value) {
    const query = (value || input).trim()
    if (!query) return
    setLoading(true)
    setError(null)
    setSimulationResult(null)
    setValidationResult(null)
    if (tx && tx.hash) {
      setPrevTx(tx)
    }
    setTx(null)
    
    // Update URL for shareable link (only for valid hashes, not XDR)
    if (query.length === 64 && !tx?.xdr_only) {
      navigate(`/tx/${query}`, { replace: true })
    }
    
    try {
      if (validateMode && query.length > 64) {
        setLoadingValidation(true)
        const stellarNetwork = config.name === 'Mainnet' ? StellarSdk.Networks.PUBLIC : StellarSdk.Networks.TESTNET
        const txEnvelope = StellarSdk.TransactionBuilder.fromXDR(query, stellarNetwork)
        const sourceAccountId = txEnvelope.source
        const txSequence = txEnvelope.sequence
        
        const accountData = await fetchAccount(sourceAccountId)
        const currentSequence = BigInt(accountData.sequence)
        const nextSequence = currentSequence + 1n
        
        const sequenceValid = BigInt(txSequence) === nextSequence
        
        const fee = BigInt(txEnvelope.fee)
        const nativeBalance = accountData.balances.find(b => b.asset_type === 'native')
        const nativeAmount = nativeBalance ? BigInt(parseFloat(nativeBalance.balance) * 1e7) : 0n
        const reserve = 2n * 5000000n // 2 XLM base reserve
        const balanceValid = nativeAmount >= fee + reserve
        
        const signers = accountData.signers
        const signersWeight = signers.reduce((sum, s) => sum + s.weight, 0)
        const threshold = accountData.thresholds.med_threshold || 1
        const signaturesValid = txEnvelope.signatures.length >= 1 && signersWeight >= threshold
        
        const totalOperationsAmount = txEnvelope.operations.reduce((total, op) => {
          if (op.amount) {
            return total + BigInt(parseFloat(op.amount) * 1e7)
          }
          return total
        }, 0n)
        const balanceWithOpsValid = nativeAmount >= fee + reserve + totalOperationsAmount
        
        setValidationResult({
          sequenceValid,
          txSequence: txSequence.toString(),
          nextSequence: nextSequence.toString(),
          balanceValid,
          balanceWithOpsValid,
          nativeBalance: nativeBalance ? parseFloat(nativeBalance.balance) : 0,
          fee: fee / BigInt(1e7),
          totalOperationsAmount: totalOperationsAmount / BigInt(1e7),
          signaturesValid,
          signatureCount: txEnvelope.signatures.length,
          signersCount: signers.length,
          threshold,
          accountData
        })
        setLoadingValidation(false)
      } else if (simulateMode && query.length > 64) {
        // Simulate XDR
        const result = await simulateTransaction(query)
        setSimulationResult(result)
      } else {
        // Normal fetch
        const result = await fetchTransaction(query)
        setTx(result)
        if (!result.xdr_only) {
          addToHistory(result)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleHistorySelect(hash) {
    setInput(hash)
    setSimulateMode(false)
    handleInspect(hash)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleInspect()
  }

  async function loadExample() {
    setLoading(true)
    setError(null)
    setTx(null)
    setSimulateMode(false)
    try {
      const res = await fetch(`${config.horizonUrl}/transactions?limit=1&order=desc`)
      const data = await res.json()
      const hash = data._embedded.records[0].hash
      setInput(hash)
      const result = await fetchTransaction(hash)
      setTx(result)
      addToHistory(result)
    } catch (err) {
      setError('Could not load example transaction.')
    } finally {
      setLoading(false)
    }
  }

  async function handleFindPaths(e) {
    e.preventDefault()
    if (!pathSourceAccount.trim() || !pathDestAmount.trim()) return
    setLoadingPaths(true)
    setPathsError(null)
    setPaths([])
    setHorizonUrl(config.horizonUrl)
    try {
      const foundPaths = await findPaymentPaths(
        pathSourceAccount.trim(),
        pathDestType,
        pathDestCode.trim(),
        pathDestIssuer.trim(),
        pathDestAmount.trim()
      )
      setPaths(foundPaths)
    } catch (err) {
      setPathsError(err.message)
    } finally {
      setLoadingPaths(false)
    }
  }

  function handleBookmarkToggle(value, type, label) {
    if (isBookmarked(value)) {
      const bookmark = bookmarks.find(b => b.value === value)
      if (bookmark) removeBookmark(bookmark.id)
    } else {
      addBookmark({ value, type, label })
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Transaction Inspector</h1>
        <p className={styles.subtitle}>
          Paste a Stellar transaction hash or XDR string to decode it into plain English.
        </p>
      </div>

      <NetworkStatus />

      <TransactionSearch onSelectTransaction={(hash) => { setSimulateMode(false); handleInspect(hash); }} />

      <TransactionHistory
        history={history}
        onSelect={handleHistorySelect}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />

      <div className={styles.searchRow}>
        <div className={styles.inputWrap}>
          <Search size={15} strokeWidth={1.5} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Transaction hash or XDR…"
            spellCheck={false}
            autoComplete="off"
          />
          {input && (
            <button 
              className={styles.clearBtn} 
              onClick={(e) => {
                e.preventDefault()
                setInput('')
                setShowDropdown(true)
              }}
              aria-label="Clear input"
            >
              <X size={14} />
            </button>
          )}
          {showDropdown && history.length > 0 && (
            <div className={styles.dropdown}>
              {history.map(item => (
                <button
                  key={item.hash}
                  className={styles.dropdownItem}
                  onClick={() => {
                    setInput(item.hash)
                    handleHistorySelect(item.hash)
                    setShowDropdown(false)
                  }}
                >
                  <span className={styles.dropdownHash}>
                    {item.hash.slice(0, 10)}…{item.hash.slice(-8)}
                  </span>
                  <span className={styles.dropdownMeta}>
                    {item.operationCount} op{item.operationCount !== 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button 
          className={`${styles.btnSecondary} ${simulateMode ? styles.btnSecondaryActive : ''}`} 
          onClick={() => { setSimulateMode(!simulateMode); setValidateMode(false); setSimulationResult(null); setValidationResult(null); }}
          disabled={loading}
          style={{ minWidth: 'auto', padding: '0 12px' }}
        >
          <Eye size={14} style={{ marginRight: 6 }} />
          Simulate
        </button>
        <button 
          className={`${styles.btnSecondary} ${validateMode ? styles.btnSecondaryActive : ''}`} 
          onClick={() => { setValidateMode(!validateMode); setSimulateMode(false); setValidationResult(null); setSimulationResult(null); }}
          disabled={loading}
          style={{ minWidth: 'auto', padding: '0 12px' }}
        >
          <CheckCircle2 size={14} style={{ marginRight: 6 }} />
          Validate
        </button>
        <button className={styles.btnPrimary} onClick={() => handleInspect()} disabled={loading || loadingValidation}>
          {loading || loadingValidation ? <Loader2 size={15} className={styles.spin} /> : validateMode ? 'Validate' : simulateMode ? 'Simulate' : 'Inspect'}
        </button>
        <button className={styles.btnSecondary} onClick={loadExample} disabled={loading}>
          Example
        </button>
      </div>

      {simulateMode && (
        <div className={styles.simulateNotice}>
          Simulate mode enabled: paste an XDR to run a dry-run simulation (no transaction will be broadcast)
        </div>
      )}
      {validateMode && (
        <div className={styles.simulateNotice}>
          Validate mode enabled: paste a signed XDR to validate sequence, balance, and signatures without broadcasting
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <AlertCircle size={15} strokeWidth={1.5} />
          {error}
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <Loader2 size={20} className={styles.spin} />
          <span>Fetching from Horizon…</span>
        </div>
      )}

      {tx && (
        <TransactionView 
          tx={{
            ...tx,
            onBookmarkToggle: handleBookmarkToggle,
            isBookmarked: isBookmarked
          }} 
        />
      )}
      {tx && prevTx && (
        <>
          <button 
            className={styles.diffBtn}
            onClick={() => setShowDiff(!showDiff)}
          >
            <GitCompare size={14} />
            {showDiff ? 'Hide Diff' : 'Show Diff with Previous'}
          </button>
          {showDiff && <TransactionDiff tx1={prevTx} tx2={tx} onClose={() => setShowDiff(false)} />}
        </>
      )}

      {simulationResult && (
        <div className={styles.wrap}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.tabActive}`}>Simulation Result</button>
          </div>
          <div className={styles.section}>
            <div className={styles.rawBlock}>
              <div className={styles.rawHeader}>
                <span className={styles.rawLabel}>Simulation Output</span>
              </div>
              <pre className={styles.xdr}>{JSON.stringify(simulationResult, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
      {validationResult && (
        <div className={styles.wrap}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.tabActive}`}>Validation Result</button>
          </div>
          <div className={styles.section}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  Sequence Number
                </span>
                <span className={styles.fieldValue}>
                  {validationResult.sequenceValid ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                  ) : (
                    <XCircle size={14} style={{ color: 'var(--color-danger)' }} />
                  )}
                  <span style={{ marginLeft: '6px' }}>
                    Tx Sequence: {validationResult.txSequence} / Next: {validationResult.nextSequence}
                  </span>
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  Balance (Fee + Reserve)
                </span>
                <span className={styles.fieldValue}>
                  {validationResult.balanceValid ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                  ) : (
                    <XCircle size={14} style={{ color: 'var(--color-danger)' }} />
                  )}
                  <span style={{ marginLeft: '6px' }}>
                    Balance: {validationResult.nativeBalance.toFixed(7)} XLM / Fee: {validationResult.fee.toFixed(7)} XLM
                  </span>
                </span>
              </div>
              {validationResult.totalOperationsAmount > 0 && (
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>
                    Balance (Including Ops)
                  </span>
                  <span className={styles.fieldValue}>
                    {validationResult.balanceWithOpsValid ? (
                      <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                    ) : (
                      <XCircle size={14} style={{ color: 'var(--color-danger)' }} />
                    )}
                    <span style={{ marginLeft: '6px' }}>
                      Total Op Amount: {validationResult.totalOperationsAmount.toFixed(7)} XLM
                    </span>
                  </span>
                </div>
              )}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  Signatures
                </span>
                <span className={styles.fieldValue}>
                  {validationResult.signaturesValid ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                  ) : (
                    <XCircle size={14} style={{ color: 'var(--color-danger)' }} />
                  )}
                  <span style={{ marginLeft: '6px' }}>
                    {validationResult.signatureCount} signatures, {validationResult.signersCount} signers, threshold: {validationResult.threshold}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!tx && !simulationResult && !loading && !error && (
        <div className={styles.empty}>
          <p>Enter a transaction hash above to get started, or try the <button className={styles.link} onClick={loadExample}>example transaction</button>.</p>
        </div>
      )}

      {/* Path Payment Finder */}
      <div className={styles.pathFinderSection}>
        <h2 className={styles.pathFinderTitle}>Path Payment Finder</h2>
        <form className={styles.pathFinderForm} onSubmit={handleFindPaths}>
          <div className={styles.pathFinderRow}>
            <div className={styles.pathInputGroup}>
              <label className={styles.pathLabel}>Source Account</label>
              <input
                type="text"
                placeholder="Account address"
                value={pathSourceAccount}
                onChange={(e) => setPathSourceAccount(e.target.value)}
                className={styles.pathInput}
              />
            </div>
          </div>
          <div className={styles.pathFinderRow}>
            <div className={styles.pathInputGroup}>
              <label className={styles.pathLabel}>Destination Asset</label>
              <div className={styles.assetInputs}>
                <select
                  value={pathDestType}
                  onChange={(e) => setPathDestType(e.target.value)}
                  className={styles.assetTypeSelect}
                >
                  <option value="native">XLM (Native)</option>
                  <option value="credit_alphanum4">Credit (4)</option>
                  <option value="credit_alphanum12">Credit (12)</option>
                </select>
                {pathDestType !== 'native' && (
                  <>
                    <input
                      type="text"
                      placeholder="Code"
                      value={pathDestCode}
                      onChange={(e) => setPathDestCode(e.target.value)}
                      className={styles.pathInputSmall}
                    />
                    <input
                      type="text"
                      placeholder="Issuer"
                      value={pathDestIssuer}
                      onChange={(e) => setPathDestIssuer(e.target.value)}
                      className={styles.pathInputSmall}
                    />
                  </>
                )}
              </div>
            </div>
            <div className={styles.pathInputGroup}>
              <label className={styles.pathLabel}>Destination Amount</label>
              <input
                type="text"
                placeholder="Amount"
                value={pathDestAmount}
                onChange={(e) => setPathDestAmount(e.target.value)}
                className={styles.pathInputSmall}
              />
            </div>
          </div>
          <button
            type="submit"
            className={styles.pathFindBtn}
            disabled={loadingPaths}
          >
            {loadingPaths ? <Loader2 size={14} className={styles.spin} /> : 'Find Paths'}
          </button>
        </form>
        {pathsError && (
          <div className={styles.error}>
            <AlertCircle size={15} strokeWidth={1.5} />
            {pathsError}
          </div>
        )}
        {paths.length > 0 && (
          <div className={styles.pathsList}>
            {paths.map((path, index) => (
              <div key={index} className={styles.pathCard}>
                <div className={styles.pathHeader}>
                  <div className={styles.pathSource}>
                    <span className={styles.pathAssetLabel}>Source</span>
                    <span className={styles.pathAssetAmount}>
                      {path.source_amount} {path.source_asset_type === 'native' ? 'XLM' : `${path.source_asset_code}`}
                    </span>
                  </div>
                  <ArrowRight size={16} />
                  <div className={styles.pathDest}>
                    <span className={styles.pathAssetLabel}>Destination</span>
                    <span className={styles.pathAssetAmount}>
                      {path.destination_amount} {path.destination_asset_type === 'native' ? 'XLM' : `${path.destination_asset_code}`}
                    </span>
                  </div>
                </div>
                {path.path && path.path.length > 0 && (
                  <div className={styles.pathSteps}>
                    <div className={styles.pathStepsLabel}>Path:</div>
                    <div className={styles.pathStepsList}>
                      {path.path.map((step, stepIndex) => (
                        <div key={stepIndex} className={styles.pathStep}>
                          {step.asset_type === 'native' ? 'XLM' : `${step.asset_code} (${step.asset_issuer.slice(0, 8)}…${step.asset_issuer.slice(-4)})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

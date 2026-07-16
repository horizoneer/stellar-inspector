import React, { Component } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import styles from './ErrorBoundary.module.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            <p className={styles.errorMessage}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorSummary}>Error details</summary>
                <pre className={styles.errorStack}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button 
              className={styles.resetButton}
              onClick={this.handleReset}
            >
              <RefreshCw size={16} style={{ marginRight: 8 }} />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

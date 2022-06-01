import React, { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.toString()}</p>
          <p>{this.state.errorInfo.componentStack}</p>
        </div>
      )
    }
    return this.props.children
  }
}

export const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{ display: 'flex', flexDirection: 'column', rowGap: '5px', marginTop: '15px' }} role="alert">
    <p style={{ fontSize: '1.2rem', color: 'white' }}>Something went wrong</p>
    <pre>{error.message}</pre>
    <button type="button" className="button" onClick={resetErrorBoundary}>
      Try again
    </button>
  </div>
)

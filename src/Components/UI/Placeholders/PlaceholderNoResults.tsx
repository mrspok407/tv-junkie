import React from 'react'

const PlaceholderNoResults = ({ className, message }: { className?: string; message: string }) => {
  return <div className={`placeholder--no-results ${className || ''}`}>{message}</div>
}

export default PlaceholderNoResults

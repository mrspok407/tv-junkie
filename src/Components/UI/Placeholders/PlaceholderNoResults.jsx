import React from 'react'

const PlaceholderNoResults = ({ className, message }) => {
  return <div className={`placeholder--no-results ${className || ''}`}>{message}</div>
}

export default PlaceholderNoResults

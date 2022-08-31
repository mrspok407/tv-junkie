import React from 'react'

const Loader = ({ className = '' }) => {
  return (
    <div className={`loader ${className}`}>
      <div className="loader-shadow">
        <div />
        <div />
        <div />
      </div>
      <div className="loader-dots">
        <div />
        <div />
        <div />
      </div>
    </div>
  )
}

export default Loader

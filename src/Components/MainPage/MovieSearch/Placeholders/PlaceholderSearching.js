import React from "react"

export default ({ className = "" }) => (
  <div className={`placeholder ${className}`}>
    <div className="placeholder__image" />
    <div className="placeholder__info">
      <div className="placeholder__line-one" />
      <div className="placeholder__line-two" />
    </div>
  </div>
)

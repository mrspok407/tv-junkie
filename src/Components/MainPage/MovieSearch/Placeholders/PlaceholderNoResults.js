import React from "react"

export default ({ className = "", message = "Nothing found" }) => (
  <div className={`placeholder placeholder--no-results ${className}`}>
    {message}
  </div>
)

import React, { useState, useEffect } from "react"

export default function FullContentInfo({
  match,
  match: {
    params: { id }
  }
}) {
  console.log(match)
  return <div>{id}</div>
}

import React, { useState, useEffect } from 'react'

type Props = {
  property: string
  ref: any
}

const useGetPropertyValue = ({ property, ref }: Props) => {
  if (!ref) return null

  const value = getComputedStyle(ref as Element).getPropertyValue(property)
  return value
}

export default useGetPropertyValue

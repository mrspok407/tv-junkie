import { useState, useCallback } from 'react'

const useCallbackRef = <T,>() => {
  const [ref, setRef] = useState<T>(null!)
  const userRatingCallbackRef = useCallback((node: any) => {
    if (node !== null) {
      setRef(node)
    }
  }, [])

  return [ref, userRatingCallbackRef] as const
}

export default useCallbackRef

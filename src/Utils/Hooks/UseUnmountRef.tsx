import { useEffect, useRef } from 'react'

const useUnmountRef = () => {
  const isUnmounted = useRef(false)
  useEffect(() => {
    return () => {
      isUnmounted.current = true
    }
  }, [])
  return isUnmounted
}

export default useUnmountRef

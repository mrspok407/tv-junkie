import React, { useState, useEffect, useRef, useCallback } from 'react'
import useClickOutside from 'Utils/Hooks/UseClickOutside'

const FADEOUT_DURATION = 500

const useDisableWarning = () => {
  const [disableWarning, setDisableWarning] = useState(false)
  const [fadeOutStart, setFadeOutStart] = useState(false)
  const ref = useRef<any>(null)

  const disableWarningRef = useRef(false)

  const fadeOutTimerRef = useRef<number | null>(null)

  const showDisableWarning = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDisableWarning(true)
  }

  const handleClickOutside = useCallback(() => {
    if (fadeOutTimerRef.current !== null) return
    if (!disableWarningRef.current) return
    setFadeOutStart(true)
    console.log('handleClickOutside')

    fadeOutTimerRef.current = window.setTimeout(() => {
      setDisableWarning(false)
      setFadeOutStart(false)
      fadeOutTimerRef.current = null
    }, FADEOUT_DURATION)
  }, [])
  useClickOutside({ ref, callback: handleClickOutside })

  useEffect(() => {
    return () => {
      window.clearTimeout(fadeOutTimerRef.current || 0)
    }
  }, [])
  useEffect(() => {
    disableWarningRef.current = disableWarning
  }, [disableWarning])

  return [disableWarning, showDisableWarning, fadeOutStart, ref] as const
}

export default useDisableWarning

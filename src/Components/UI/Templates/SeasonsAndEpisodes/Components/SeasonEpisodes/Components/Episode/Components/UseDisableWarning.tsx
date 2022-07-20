import React, { useState, useEffect, useRef, useCallback } from 'react'
import useClickOutside from 'Utils/Hooks/UseClickOutside'

const useDisableWarning = () => {
  const [checkboxDisableWarning, setCheckboxDisableWarning] = useState(false)
  const [fadeOutStart, setFadeOutStart] = useState(false)
  const checkboxRef = useRef<HTMLDivElement>(null)

  const disableWarningRef = useRef(false)
  const componentUnmounted = useRef(false)

  const showDisableWarning = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCheckboxDisableWarning(true)
  }

  const handleClickOutside = useCallback(() => {
    if (!disableWarningRef.current) return
    setFadeOutStart(true)

    setTimeout(() => {
      if (componentUnmounted.current) return
      setCheckboxDisableWarning(false)
      setFadeOutStart(false)
    }, 2500)
  }, [])
  useClickOutside({ ref: checkboxRef, callback: handleClickOutside })

  useEffect(() => {
    return () => {
      componentUnmounted.current = true
    }
  }, [])
  useEffect(() => {
    disableWarningRef.current = checkboxDisableWarning
  }, [checkboxDisableWarning])

  return [checkboxDisableWarning, showDisableWarning, fadeOutStart, checkboxRef] as const
}

export default useDisableWarning

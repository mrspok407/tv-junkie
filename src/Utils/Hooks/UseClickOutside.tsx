import { useEffect, useCallback, useState } from 'react'
import * as _isFunction from 'lodash.isfunction'

type Props = {
  ref: any
  callback: () => void
}

const useClickOutside = ({ ref, callback }: Props) => {
  const handleClickOutside = useCallback(
    (e: CustomEvent) => {
      if (!_isFunction(callback)) return
      if (!ref.current?.contains(e.target as Node)) {
        callback()
      }
    },
    [ref, callback],
  )

  useEffect(() => {
    console.log('clickOutside')
    document.addEventListener('mousedown', handleClickOutside as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener)
    }
  }, [handleClickOutside])
}

export default useClickOutside

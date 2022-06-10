import { useEffect, useCallback } from 'react'
import * as _isFunction from 'lodash.isfunction'

type Props = {
  ref: { current: HTMLElement }
  callback: () => void
}

const useClickOutside = ({ ref, callback }: Props) => {
  const handleClickOutside = useCallback(
    (e: CustomEvent) => {
      if (!_isFunction(callback)) return
      if (!ref.current?.contains(e.target as Node)) {
        console.log('click')
        callback()
      }
    },
    [ref, callback],
  )

  useEffect(() => {
    console.log('event listener on')
    document.addEventListener('mousedown', handleClickOutside as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener)
    }
  }, [handleClickOutside])
}

export default useClickOutside

import { useCallback, useEffect } from 'react'
import { throttle } from 'throttle-debounce'
import { isScrollNearBottom } from 'Utils'

type Props = {
  callback: () => void
  scrollThreshold: number
  timeOut: number
}

const useScrollEffect = ({ callback, scrollThreshold, timeOut }: Props) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = useCallback(
    throttle(timeOut, () => {
      if (isScrollNearBottom({ scrollThreshold })) {
        callback()
      }
    }),
    [callback],
  )

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])
}

export default useScrollEffect

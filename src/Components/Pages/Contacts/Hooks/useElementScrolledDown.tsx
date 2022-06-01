import { useLayoutEffect, useState, useCallback } from 'react'
import { throttle } from 'throttle-debounce'

type Props = {
  element: HTMLDivElement
  threshold?: number
}

const useElementScrolledDown = ({ element, threshold = 0 }: Props) => {
  const [isScrolledDown, setIsScrolledDown] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = useCallback(
    throttle(200, () => {
      const { height } = element.getBoundingClientRect()
      const { scrollHeight } = element
      const { scrollTop } = element

      if (scrollHeight <= scrollTop + height + threshold) {
        setIsScrolledDown(true)
      } else {
        setIsScrolledDown(false)
      }
    }),
    [element],
  )

  useLayoutEffect(() => {
    if (!element) return
    element.addEventListener('scroll', handleScroll)

    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, element])

  return isScrolledDown
}

export default useElementScrolledDown

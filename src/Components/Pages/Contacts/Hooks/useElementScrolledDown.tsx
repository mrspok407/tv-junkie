import { useLayoutEffect, useState, useCallback } from "react"
import { throttle } from "throttle-debounce"

type Props = {
  element: HTMLDivElement
  threshold?: number
}

const useElementScrolledDown = ({ element, threshold = 0 }: Props) => {
  const [isScrolledDown, setIsScrolledDown] = useState(false)

  const handleScroll = useCallback(
    throttle(200, () => {
      const height = element.getBoundingClientRect().height
      const scrollHeight = element.scrollHeight
      const scrollTop = element.scrollTop

      if (scrollHeight <= scrollTop + height + threshold) {
        setIsScrolledDown(true)
      } else {
        setIsScrolledDown(false)
      }
    }),
    [element]
  )

  useLayoutEffect(() => {
    if (!element) return
    element.addEventListener("scroll", handleScroll)

    return () => {
      element.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  return isScrolledDown
}

export default useElementScrolledDown

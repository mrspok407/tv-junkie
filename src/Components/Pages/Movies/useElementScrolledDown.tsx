import { useLayoutEffect, useState, useCallback } from "react"
import { throttle } from "throttle-debounce"

type Props = {
  element: HTMLDivElement
}

const useElementScrolledDown = ({ element }: Props) => {
  const [isScrolledDown, setIsScrolledDown] = useState(false)

  const handleScroll = useCallback(
    throttle(200, () => {
      const height = element.getBoundingClientRect().height
      const scrollHeight = element.scrollHeight
      const scrollTop = element.scrollTop

      if (scrollHeight === scrollTop + height) {
        console.log("scroll bottom")
        setIsScrolledDown(true)
      } else {
        console.log("scroll not bottom")
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
  }, [element, handleScroll])

  return isScrolledDown
}

export default useElementScrolledDown

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-use-before-define */
/* eslint-disable no-else-return */
import { useLayoutEffect, useCallback, useState } from "react"
import debounce from "debounce"

export default function UseRect(ref) {
  const [rect, setRect] = useState(getRect(ref || null))

  const handleResize = useCallback(() => {
    if (!ref) {
      return
    }

    setRect(getRect(ref))
  }, [ref])

  const handleResizeDeb = debounce(() => handleResize(), 200)

  useLayoutEffect(() => {
    const element = ref
    if (!element) {
      return
    }

    handleResizeDeb()

    if (window.ResizeObserver) {
      let resizeObserver = new ResizeObserver(() => handleResizeDeb())
      resizeObserver.observe(element)

      return () => {
        if (!resizeObserver) {
          return
        }

        resizeObserver.disconnect()
        resizeObserver = null
      }
    } else {
      window.addEventListener("resize", handleResizeDeb)

      return () => {
        window.removeEventListener("resize", handleResizeDeb)
      }
    }
  }, [ref])

  return rect
}

function getRect(element) {
  if (!element) {
    return {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0
    }
  }

  return element.getBoundingClientRect()
}

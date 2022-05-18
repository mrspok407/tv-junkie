import { ContainerRectInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import { useCallback, useRef, useEffect } from "react"

type Props = {
  inputRef: HTMLDivElement
  chatContainerRef: HTMLDivElement
  getContainerRect: () => ContainerRectInterface
}

const useInputResizeObserver = ({ inputRef, chatContainerRef, getContainerRect }: Props) => {
  const { contactsState } = useFrequentVariables()
  const { activeChat } = contactsState

  const prevHeight = useRef(0)

  const handleResize = useCallback(() => {
    if (!inputRef) return
    if (!chatContainerRef) return
    const height = inputRef.getBoundingClientRect().height
    const heightDiff = height - prevHeight.current

    chatContainerRef.scrollTop = getContainerRect().scrollTop + Math.max(heightDiff, 0)
    prevHeight.current = height
  }, [inputRef, activeChat]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!inputRef) return
    prevHeight.current = inputRef.getBoundingClientRect().height
    if (window.ResizeObserver) {
      let resizeObserver = new ResizeObserver(() => handleResize())
      resizeObserver.observe(inputRef)

      return () => {
        if (!resizeObserver) return
        resizeObserver.disconnect()
      }
    } else {
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [inputRef, handleResize]) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useInputResizeObserver

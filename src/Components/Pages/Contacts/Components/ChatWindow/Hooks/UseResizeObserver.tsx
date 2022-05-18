import useFirebaseReferences from "Components/Pages/Contacts/Hooks/UseFirebaseReferences"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import { useLayoutEffect, useCallback } from "react"

type Props = {
  chatContainerRef: HTMLDivElement
  isScrollBottomRef: React.MutableRefObject<boolean>
}

const useResizeObserver = ({ chatContainerRef, isScrollBottomRef }: Props) => {
  const { contactsState } = useFrequentVariables()
  const firebaseRefs = useFirebaseReferences()
  const { activeChat } = contactsState

  const handleResize = useCallback(() => {
    if (!chatContainerRef) return
    const height = chatContainerRef.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.scrollHeight

    if (scrollHeight <= height) {
      isScrollBottomRef.current = true
      firebaseRefs.updateMemberStatus({ value: { chatBottom: true } })
    }
  }, [chatContainerRef, activeChat]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (window.ResizeObserver) {
      let resizeObserver = new ResizeObserver(() => handleResize())
      resizeObserver.observe(chatContainerRef)

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
  }, [chatContainerRef, handleResize])
}

export default useResizeObserver

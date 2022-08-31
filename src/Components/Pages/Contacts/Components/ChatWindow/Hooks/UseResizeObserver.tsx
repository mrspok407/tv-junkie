import useFirebaseReferences from 'Components/Pages/Contacts/Hooks/UseFirebaseReferences'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { useLayoutEffect, useCallback } from 'react'

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
    const { height } = chatContainerRef.getBoundingClientRect()
    const { scrollHeight } = chatContainerRef

    if (scrollHeight <= height) {
      isScrollBottomRef.current = true
      firebaseRefs.updateMemberStatus({ value: { chatBottom: true } })
    }
  }, [chatContainerRef, activeChat]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => handleResize())
      resizeObserver.observe(chatContainerRef)

      return () => {
        if (!resizeObserver) return
        resizeObserver.disconnect()
      }
    }
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
  }, [chatContainerRef, handleResize])
}

export default useResizeObserver

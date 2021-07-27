import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { useLayoutEffect, useCallback } from "react"

type Props = {
  chatContainerRef: HTMLDivElement
  isScrollBottomRef: React.MutableRefObject<boolean>
  contactInfo: ContactInfoInterface
}

const useResizeObserver = ({ chatContainerRef, isScrollBottomRef, contactInfo }: Props) => {
  const { firebase, authUser, contactsState } = useFrequentVariables()
  const { activeChat } = contactsState

  const handleResize = useCallback(() => {
    console.log("handleResize")
    if (!chatContainerRef) return
    const height = chatContainerRef.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.scrollHeight

    console.log({ scrollHeight })
    console.log({ height })

    if (scrollHeight <= height) {
      isScrollBottomRef.current = true
      firebase
        .chatMemberStatus({
          chatKey: activeChat.chatKey,
          memberKey: authUser?.uid!,
          isGroupChat: contactInfo.isGroupChat
        })
        .update({ chatBottom: true })
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

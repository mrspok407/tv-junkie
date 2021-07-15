import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { useState, useEffect, useCallback, useRef } from "react"

type Props = {
  activeChat: { chatKey: string }
  contactInfo: ContactInfoInterface
}

const usePageFocusHandler = ({ activeChat, contactInfo }: Props) => {
  const { authUser, firebase } = useFrequentVariables()
  const [pageInFocus, setPageInFocus] = useState(true)
  const focusInterval = useRef<number | null>(null)

  const focusHandler = useCallback(() => {
    focusInterval.current = window.setInterval(() => {
      firebase
        .chatMemberStatus({
          chatKey: activeChat.chatKey,
          memberKey: authUser?.uid!,
          isGroupChat: contactInfo.isGroupChat
        })
        .update({ pageInFocus: document.hasFocus() })
      setPageInFocus(document.hasFocus())
    }, 250)
  }, [activeChat, firebase, authUser]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    focusHandler()
    return () => {
      window.clearInterval(focusInterval.current || 0)
    }
  }, [focusHandler])

  return { pageInFocus }
}

export default usePageFocusHandler

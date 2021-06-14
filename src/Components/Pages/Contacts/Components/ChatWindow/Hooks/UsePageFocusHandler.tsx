import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import { useState, useEffect, useCallback, useRef, useContext } from "react"

type Props = {
  activeChat: { chatKey: string }
  contactInfo: ContactInfoInterface
}

const usePageFocusHandler = ({ activeChat, contactInfo }: Props) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)
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
  }, [activeChat])

  useEffect(() => {
    focusHandler()
    return () => {
      window.clearInterval(focusInterval.current || 0)
    }
  }, [focusHandler])

  return { pageInFocus }
}

export default usePageFocusHandler

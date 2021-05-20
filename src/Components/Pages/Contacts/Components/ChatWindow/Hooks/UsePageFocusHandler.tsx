import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { useState, useEffect, useCallback, useRef, useContext } from "react"

type Props = {
  activeChat: { chatKey: string }
}

const usePageFocusHandler = ({ activeChat }: Props) => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useContext(AppContext)
  const [pageInFocus, setPageInFocus] = useState(true)
  const focusInterval = useRef<number | null>(null)

  const focusHandler = useCallback(() => {
    console.log(activeChat.chatKey)
    focusInterval.current = window.setInterval(() => {
      firebase
        .chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid! })
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

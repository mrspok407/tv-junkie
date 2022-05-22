import { ContactInfoInterface } from 'Components/Pages/Contacts/@Types'
import useFirebaseReferences from 'Components/Pages/Contacts/Hooks/UseFirebaseReferences'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { useState, useEffect, useCallback, useRef } from 'react'

type Props = {
  activeChat: { chatKey: string }
}

const usePageFocusHandler = ({ activeChat }: Props) => {
  const { authUser, firebase } = useFrequentVariables()
  const firebaseRefs = useFirebaseReferences()
  const [pageInFocus, setPageInFocus] = useState(true)
  const focusInterval = useRef<number | null>(null)

  const focusHandler = useCallback(() => {
    focusInterval.current = window.setInterval(() => {
      firebaseRefs.updateMemberStatus({ value: { pageInFocus: document.hasFocus() } })
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

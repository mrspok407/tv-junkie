import useFirebaseReferences from 'Components/Pages/Contacts/Hooks/UseFirebaseReferences'

let typingTimer: number | null = null
const TIMEOUT = 1500
export const updateTyping = async ({
  setTypingNull = null,
  firebaseRefs,
}: {
  setTypingNull?: boolean | null
  firebaseRefs: ReturnType<typeof useFirebaseReferences>
}) => {
  if (setTypingNull) {
    firebaseRefs.updateMemberStatus({ value: { isTyping: null } })
    return
  }

  firebaseRefs.updateMemberStatus({ value: { isTyping: true } })
  if (typingTimer) window.clearTimeout(typingTimer)

  typingTimer = window.setTimeout(() => {
    firebaseRefs.updateMemberStatus({ value: { isTyping: null } })
  }, TIMEOUT)
}

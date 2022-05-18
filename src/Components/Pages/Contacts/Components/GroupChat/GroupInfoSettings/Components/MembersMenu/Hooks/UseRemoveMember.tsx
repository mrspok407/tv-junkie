import { MembersStatusGroupChatInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import { useState } from "react"

const useRemoveMember = () => {
  const { firebase, errors, contactsState } = useFrequentVariables()
  const { activeChat } = contactsState
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false)

  const removeMember = async ({ member }: { member: MembersStatusGroupChatInterface }) => {
    if (removeMemberLoading) return
    try {
      setRemoveMemberLoading(true)
      const removeMemberFromGroupCloud = firebase.httpsCallable("removeMemberFromGroup")
      await removeMemberFromGroupCloud({ member, groupChatKey: activeChat.chatKey })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error removing member. Please reload the page."
      })
    } finally {
      setRemoveMemberLoading(false)
    }
  }

  return { removeMember, removeMemberLoading }
}

export default useRemoveMember

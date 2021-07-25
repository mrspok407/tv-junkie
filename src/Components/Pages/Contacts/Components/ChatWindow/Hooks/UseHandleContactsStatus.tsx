import { MembersStatusGroupChatInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { useEffect } from "react"

type Props = {
  chatKey: string
  contactKey: string
  isGroupChat: boolean
}

const useHandleContactsStatus = ({ chatKey, contactKey, isGroupChat }: Props) => {
  const { firebase, authUser, contactsDispatch } = useFrequentVariables()

  useEffect(() => {
    if (isGroupChat) {
      firebase.groupChatMembersStatus({ chatKey }).on("value", (snapshot: any) => {
        let membersStatus: MembersStatusGroupChatInterface[] = []
        snapshot.forEach((member: { val: () => MembersStatusGroupChatInterface; key: string }) => {
          membersStatus.push({ ...member.val(), key: member.key })
        })
        contactsDispatch({ type: "updateGroupChatMembersStatus", payload: { membersStatus, chatKey } })
      })

      firebase.groupChatParticipants({ chatKey }).on("value", (snapshot: any) => {
        let participants: string[] = []
        snapshot.forEach((participant: { key: string }) => {
          participants.push(participant.key)
        })
        contactsDispatch({ type: "updateGroupChatParticipants", payload: { participants, chatKey } })
      })
    } else {
      firebase.chatMemberStatus({ chatKey, memberKey: contactKey, isGroupChat: false }).on("value", (snapshot: any) => {
        contactsDispatch({
          type: "updateContactsStatus",
          payload: { status: snapshot.val() || {}, chatKey }
        })
      })
    }

    firebase
      .chatMemberStatus({ chatKey, memberKey: authUser?.uid!, isGroupChat })
      .onDisconnect()
      .update({ isOnline: null, pageInFocus: null })
  }, [chatKey, contactKey, isGroupChat, contactsDispatch, firebase, authUser])
}

export default useHandleContactsStatus

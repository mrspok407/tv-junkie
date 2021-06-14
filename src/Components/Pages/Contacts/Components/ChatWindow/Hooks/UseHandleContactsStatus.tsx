import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { MembersStatusGroupChatInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"

type Props = {
  chatKey: string
  contactKey: string
  isGroupChat: boolean
}

const useHandleContactsStatus = ({ chatKey, contactKey, isGroupChat }: Props) => {
  const { firebase, authUser, contactsContext } = useFrequentVariables()

  useEffect(() => {
    if (isGroupChat) {
      firebase.groupChatMembersStatus({ chatKey }).on("value", (snapshot: any) => {
        let membersStatus: MembersStatusGroupChatInterface[] = []
        snapshot.forEach((member: { val: () => MembersStatusGroupChatInterface; key: string }) => {
          membersStatus.push({ ...member.val(), key: member.key })
        })
        contactsContext?.dispatch({ type: "updateGroupChatMembersStatus", payload: { membersStatus, chatKey } })
      })
    } else {
      firebase.chatMemberStatus({ chatKey, memberKey: contactKey, isGroupChat: false }).on("value", (snapshot: any) => {
        contactsContext?.dispatch({
          type: "updateContactsStatus",
          payload: { status: snapshot.val() || {}, chatKey }
        })
      })
    }

    firebase
      .chatMemberStatus({ chatKey, memberKey: authUser?.uid!, isGroupChat: false })
      .onDisconnect()
      .update({ isOnline: null, pageInFocus: false })
  }, [chatKey, contactKey, isGroupChat])
}

export default useHandleContactsStatus

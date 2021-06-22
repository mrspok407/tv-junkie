import { ContactInfoInterface, MembersStatusGroupChatInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { _removeMemberFromGroup } from "firebaseHttpCallableFunctionsTests"
import React, { useState, useEffect } from "react"

const useRemoveMember = () => {
  const { firebase, authUser, errors, contactsState } = useFrequentVariables()
  const { activeChat, chatMembersStatus, contacts } = contactsState
  const chatMembersStatusData = chatMembersStatus[activeChat.chatKey]

  const removeMember = async ({ member }: { member: MembersStatusGroupChatInterface }) => {
    // const removeMemberFromGroupCloud = firebase.httpsCallable("_removeMemberFromGroup")
    // removeMemberFromGroupCloud({ member, groupChatKey: activeChat.chatKey, memberStatus })
    const timeStampData = firebase.timeStamp()
    try {
      await _removeMemberFromGroup({
        data: { member, groupChatKey: activeChat.chatKey, timeStampData },
        context: { authUser: authUser! },
        database: firebase.database()
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error removing member. Please reload the page."
      })
    }
  }

  return { removeMember }
}

export default useRemoveMember

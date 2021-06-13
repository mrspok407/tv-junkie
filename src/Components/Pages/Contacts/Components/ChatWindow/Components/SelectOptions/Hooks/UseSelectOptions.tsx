import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect, useContext } from "react"
import useHandleMessageOptions from "../../MessageInfo/FirebaseHelpers/UseHandleMessageOptions"

type Props = {}

const useSelectOptions = () => {
  const { firebase, authUser, contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, renderedMessagesList, contacts, selectedMessages } = contactsContext?.state!
  const selectedMessagesData = selectedMessages[activeChat.chatKey]

  const { deleteMessage } = useHandleMessageOptions({})

  const deleteSelectedMessages = async () => {
    await deleteMessage({ deleteMessagesKeys: selectedMessagesData })
    contactsContext?.dispatch({ type: "clearSelectedMessages", payload: { chatKey: activeChat.chatKey } })
  }

  return { deleteSelectedMessages }
}

export default useSelectOptions

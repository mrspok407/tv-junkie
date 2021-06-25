import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect, useContext } from "react"
import useHandleMessageOptions from "../../MessageInfo/FirebaseHelpers/UseHandleMessageOptions"

const useSelectOptions = () => {
  const { contactsContext, contactsState } = useFrequentVariables()
  const { activeChat, selectedMessages } = contactsState

  const selectedMessagesData = selectedMessages[activeChat.chatKey]

  const { deleteMessagePrivateChat, deleteMessageGroupChat } = useHandleMessageOptions({})

  const deleteSelectedMessages = async () => {
    await deleteMessagePrivateChat({ deleteMessagesKeys: selectedMessagesData })
    contactsContext?.dispatch({ type: "clearSelectedMessages", payload: { chatKey: activeChat.chatKey } })
  }

  const deleteSelectedMessagesGroupChat = async () => {
    await deleteMessageGroupChat({ deleteMessagesKeys: selectedMessagesData })
    contactsContext?.dispatch({ type: "clearSelectedMessages", payload: { chatKey: activeChat.chatKey } })
  }

  return { deleteSelectedMessages, deleteSelectedMessagesGroupChat }
}

export default useSelectOptions

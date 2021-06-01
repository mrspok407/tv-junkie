import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import React, { useState, useEffect, useContext } from "react"
import useHandleMessageOptions from "../../MessageInfo/FirebaseHelpers/UseHandleMessageOptions"

type Props = {}

const useSelectOptions = () => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat, renderedMessagesList, contacts, selectedMessages } = context?.state!
  const selectedMessagesData = selectedMessages[activeChat.chatKey]

  const { deleteMessage } = useHandleMessageOptions({})

  const deleteSelectedMessages = async () => {
    await deleteMessage({ deleteMessagesKeys: selectedMessagesData })
    context?.dispatch({ type: "clearSelectedMessages", payload: { chatKey: activeChat.chatKey } })
  }

  return { deleteSelectedMessages }
}

export default useSelectOptions

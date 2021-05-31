import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import { ContactsContext } from "Components/Pages/Contacts/Components/@Context/ContactsContext"
import React, { useState, useEffect, useContext } from "react"

type Props = {}

const useSelectOptions = () => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat, renderedMessagesList, contacts } = context?.state!

  const deleteSelectedMessages = () => {}

  return { deleteSelectedMessages }
}

export default useSelectOptions

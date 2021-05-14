import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface } from "Components/Pages/Contacts/Types"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  contactInfo: ContactInfoInterface
}

const useContactOptions = ({ contactInfo }: Props) => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat, renderedMessagesList, contacts } = context?.state!

  const updateIsPinned = async () => {
    try {
      const timeStamp = firebase.timeStamp()
      const isPinned = !(contactInfo.pinned_lastActivityTS?.slice(0, 4) === "true")
      await firebase.contact({ authUid: authUser?.uid, contactUid: contactInfo.key }).update({
        pinned_lastActivityTS: `${isPinned}`,
        timeStamp
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    updateIsPinned
  }
}

export default useContactOptions

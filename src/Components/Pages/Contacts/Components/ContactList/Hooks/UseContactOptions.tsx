import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface } from "Components/Pages/Contacts/Types"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  contactInfo: ContactInfoInterface
  togglePopup: any
}

const useContactOptions = ({ contactInfo, togglePopup }: Props) => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat, renderedMessagesList, contacts } = context?.state!

  const updateIsPinned = async () => {
    if (togglePopup) togglePopup(false)
    context?.dispatch({ type: "updateContactPopup", payload: "" })

    try {
      // const timeStamp = firebase.timeStamp()
      const timeStamp = new Date().getTime()
      const isPinned = !(contactInfo.pinned_lastActivityTS?.slice(0, 4) === "true")
      await firebase.contact({ authUid: authUser?.uid, contactUid: contactInfo.key }).update({
        pinned_lastActivityTS: `${isPinned}_${timeStamp}`
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

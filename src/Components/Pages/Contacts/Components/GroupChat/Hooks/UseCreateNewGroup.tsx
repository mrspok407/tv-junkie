import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { _createNewGroup } from "firebaseHttpCallableFunctionsTests"
import React, { useState, useEffect } from "react"

const useCreateNewGroup = () => {
  const { firebase, authUser, errors, contactsContext, contactsState } = useFrequentVariables()
  const { groupCreation } = contactsState

  const createNewGroup = async () => {
    const timeStampData = firebase.timeStamp()

    // const newCreateGroupCloud = firebase.httpsCallable("newCreateGroup")
    // newCreateGroupCloud({ members })

    try {
      await _createNewGroup({
        data: { members: groupCreation.members, timeStamp: timeStampData },
        context: { auth: { uid: authUser?.uid } },
        database: firebase.database()
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error creating a group. Please reload the page."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    createNewGroup
  }
}

export default useCreateNewGroup

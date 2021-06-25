import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { _createNewGroup } from "firebaseHttpCallableFunctionsTests"
import React, { useState, useEffect } from "react"

const useCreateNewGroup = () => {
  const { firebase, authUser, errors, contactsContext, contactsState } = useFrequentVariables()
  const { groupCreation } = contactsState

  const createNewGroup = async () => {
    const timeStampData = firebase.timeStamp()

    // const newCreateGroupCloud = firebase.httpsCallable("newCreateGroup")
    // newCreateGroupCloud({ members: groupCreation.members, groupName: groupCreation.groupName, authUser })

    try {
      contactsContext?.dispatch({ type: "updateGroupCreation", payload: { loading: true } })
      const { newGroupChatKey } = await _createNewGroup({
        data: { members: groupCreation.members, groupName: groupCreation.groupName, timeStamp: timeStampData },
        context: { authUser: authUser! },
        database: firebase.database()
      })
      contactsContext?.dispatch({ type: "finishGroupCreation", payload: { newGroupChatKey } })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error creating a group. Please reload the page."
      })
      contactsContext?.dispatch({
        type: "updateGroupCreation",
        payload: { isActive: false, selectNameActive: false, groupName: "", error: "", loading: false }
      })
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    createNewGroup
  }
}

export default useCreateNewGroup

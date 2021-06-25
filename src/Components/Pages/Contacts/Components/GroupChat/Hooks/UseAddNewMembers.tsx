import { ContactInfoInterface, GroupCreationNewMemberInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { _addNewGroupMembers, _createNewGroup } from "firebaseHttpCallableFunctionsTests"
import React, { useState, useEffect } from "react"

const useAddNewMembers = () => {
  const { firebase, authUser, errors, contactsContext } = useFrequentVariables()
  const [newMembersLoading, setNewMembersLoading] = useState(false)

  const addNewMembers = async ({
    members,
    groupInfo
  }: {
    members: GroupCreationNewMemberInterface[]
    groupInfo: { groupName: string; key: string }
  }) => {
    setNewMembersLoading(true)
    const timeStampData = firebase.timeStamp()
    // const addNewGroupMembersCloud = firebase.httpsCallable("addNewGroupMembers")
    // addNewGroupMembersCloud({ members, groupInfo })

    try {
      await _addNewGroupMembers({
        data: { members, groupInfo, timeStamp: timeStampData },
        context: { authUser: authUser! },
        database: firebase.database()
      })
      setNewMembersLoading(false)
      contactsContext?.dispatch({ type: "updateGroupInfoSettings", payload: { isActive: false } })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error adding new members. Please reload the page."
      })
      setNewMembersLoading(false)
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    newMembersLoading,
    addNewMembers
  }
}

export default useAddNewMembers

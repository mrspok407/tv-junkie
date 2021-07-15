import { GroupCreationNewMemberInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import { _addNewGroupMembers } from "firebaseHttpCallableFunctionsTests"
import { useState } from "react"

const useAddNewMembers = () => {
  const { firebase, authUser, errors, contactsDispatch } = useFrequentVariables()
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

    try {
      // const addNewGroupMembersCloud = firebase.httpsCallable("addNewGroupMembers")
      // await addNewGroupMembersCloud({ members, groupInfo })
      await _addNewGroupMembers({
        data: { members, groupInfo, timeStamp: timeStampData },
        context: { authUser: authUser! },
        database: firebase.database()
      })
      setNewMembersLoading(false)
      contactsDispatch({ type: "updateGroupInfoSettings", payload: { isActive: false } })
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

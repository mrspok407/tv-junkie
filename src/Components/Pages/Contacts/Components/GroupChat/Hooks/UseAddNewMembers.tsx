import { GroupCreationNewMemberInterface } from 'Components/Pages/Contacts/@Types'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { useState } from 'react'

const useAddNewMembers = () => {
  const { firebase, errors, contactsDispatch } = useFrequentVariables()
  const [newMembersLoading, setNewMembersLoading] = useState(false)

  const addNewMembers = async ({
    members,
    groupInfo,
  }: {
    members: GroupCreationNewMemberInterface[]
    groupInfo: { groupName: string; key: string }
  }) => {
    setNewMembersLoading(true)

    try {
      const addNewGroupMembersCloud = firebase.httpsCallable('addNewGroupMembers')
      await addNewGroupMembersCloud({ members, groupInfo })
      setNewMembersLoading(false)
      contactsDispatch({ type: 'updateGroupInfoSettings', payload: { isActive: false } })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: 'There has been some error adding new members. Please reload the page.',
      })
      setNewMembersLoading(false)
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    newMembersLoading,
    addNewMembers,
  }
}

export default useAddNewMembers

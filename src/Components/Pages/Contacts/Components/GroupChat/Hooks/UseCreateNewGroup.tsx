import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
// import { _createNewGroup } from "firebaseHttpCallableFunctionsTests"
import { INITIAL_STATE } from "../../@Context/_reducerConfig"

const useCreateNewGroup = () => {
  const { firebase, authUser, errors, contactsState, contactsDispatch } = useFrequentVariables()
  const { groupCreation } = contactsState

  const createNewGroup = async () => {
    // const timeStampData = firebase.timeStamp()

    try {
      contactsDispatch({ type: "updateGroupCreation", payload: { loading: true } })
      const createNewGroupCloud = firebase.httpsCallable("createNewGroup")
      const result = await createNewGroupCloud({
        members: groupCreation.members,
        groupName: groupCreation.groupName,
        authUserName: authUser?.username
      })

      // const { newGroupChatKey } = await _createNewGroup({
      //   data: { members: groupCreation.members, groupName: groupCreation.groupName },
      //   context: { authUser: authUser! },
      //   database: firebase.database()
      // })
      contactsDispatch({
        type: "finishGroupCreation",
        payload: { newGroupChatKey: result.data.newGroupChatKey, groupName: groupCreation.groupName }
      })
      // contactsDispatch({
      //   type: "finishGroupCreation",
      //   payload: { newGroupChatKey, groupName: groupCreation.groupName }
      // })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error creating a group. Please reload the page."
      })
      contactsDispatch({
        type: "updateGroupCreation",
        payload: { ...INITIAL_STATE.groupCreation }
      })
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    createNewGroup
  }
}

export default useCreateNewGroup

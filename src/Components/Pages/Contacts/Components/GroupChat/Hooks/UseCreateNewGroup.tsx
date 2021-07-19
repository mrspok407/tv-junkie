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
      const data = await createNewGroupCloud({
        members: groupCreation.members,
        groupName: groupCreation.groupName,
        authUserName: authUser?.username
      })

      console.log({ data })
      // const { newGroupChatKey } = await _createNewGroup({
      //   data: { members: groupCreation.members, groupName: groupCreation.groupName, timeStamp: timeStampData },
      //   context: { authUser: authUser! },
      //   database: firebase.database()
      // })
      // contactsDispatch({ type: "finishGroupCreation", payload: { newGroupChatKey } })
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

import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { ErrorInterface, ErrorsHandlerContext } from 'Components/AppContext/Contexts/ErrorsContext'
import { useContext } from 'react'
import { INITIAL_STATE } from '../../@Context/_reducerConfig'

const useCreateNewGroup = () => {
  const { firebase, authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const handleError = useContext(ErrorsHandlerContext)
  const { groupCreation } = contactsState

  const createNewGroup = async () => {
    try {
      contactsDispatch({ type: 'updateGroupCreation', payload: { loading: true } })
      const createNewGroupCloud = firebase.httpsCallable('createNewGroup')
      const result = await createNewGroupCloud({
        members: groupCreation.members,
        groupName: groupCreation.groupName,
        authUserName: authUser?.username,
      })

      contactsDispatch({
        type: 'finishGroupCreation',
        payload: { newGroupChatKey: result.data.newGroupChatKey, groupName: groupCreation.groupName },
      })
    } catch (err) {
      const error = err as ErrorInterface['errorData']
      handleError({
        errorData: error,
        message: 'There has been some error creating a group. Please reload the page.',
      })
      contactsDispatch({
        type: 'updateGroupCreation',
        payload: { ...INITIAL_STATE.groupCreation },
      })
      throw new Error(`There has been some error updating database: ${error}`)
    }
  }

  return {
    createNewGroup,
  }
}

export default useCreateNewGroup

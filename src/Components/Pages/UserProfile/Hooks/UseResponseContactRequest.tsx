import { useContext, useState } from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { ErrorsHandlerContext } from 'Components/AppContext/Contexts/ErrorsContext'
import { handleContactRequestTest } from 'firebaseHttpCallableFunctionsTests'
import { getTime } from 'date-fns'
import { currentDate } from 'Utils'

type Props = {
  contactUid: string
}

const INITIAL_LOADING_STATE = { accept: false, rejected: false }

const useResponseContactRequest = ({ contactUid }: Props) => {
  const { firebase, authUser } = useFrequentVariables()
  const handleError = useContext(ErrorsHandlerContext)

  const [responseContactRequestLoading, setResponseContactRequestLoading] = useState(INITIAL_LOADING_STATE)

  const handleContactRequest = async ({ status }: { status: string }) => {
    if (responseContactRequestLoading.accept || responseContactRequestLoading.rejected) return
    try {
      setResponseContactRequestLoading((prevState) => ({ ...prevState, [status]: true }))
      await handleContactRequestTest({
        data: { contactUid, status },
        context: { authUser },
        database: firebase,
        timeStamp: getTime(currentDate),
      })
      // const handleContactRequestCloud = firebase.httpsCallable('handleContactRequest')
      // await handleContactRequestCloud({ contactUid, status })
    } catch (error) {
      handleError({
        errorData: error,
        message: 'There has been some error handling contact request. Please try again.',
      })

      throw new Error(`There has been some error handling contact request: ${error}`)
    } finally {
      setResponseContactRequestLoading(INITIAL_LOADING_STATE)
    }
  }

  return { handleContactRequest, responseContactRequestLoading }
}

export default useResponseContactRequest

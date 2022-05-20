import { useState } from "react"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"

type Props = {
  contactUid: string
}

const INITIAL_LOADING_STATE = { accept: false, rejected: false }

const useResponseContactRequest = ({ contactUid }: Props) => {
  const { firebase, errors } = useFrequentVariables()

  const [responseContactRequestLoading, setResponseContactRequestLoading] = useState(INITIAL_LOADING_STATE)

  const handleContactRequest = async ({ status }: { status: string }) => {
    if (responseContactRequestLoading.accept || responseContactRequestLoading.rejected) return
    try {
      setResponseContactRequestLoading((prevState) => ({ ...prevState, [status]: true }))
      const handleContactRequestCloud = firebase.httpsCallable("handleContactRequest")
      await handleContactRequestCloud({ contactUid, status })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error handling contact request. Please try again."
      })

      throw new Error(`There has been some error handling contact request: ${error}`)
    } finally {
      setResponseContactRequestLoading(INITIAL_LOADING_STATE)
    }
  }

  return { handleContactRequest, responseContactRequestLoading }
}

export default useResponseContactRequest

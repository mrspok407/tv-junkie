import { useContext, useState } from 'react'
import { uniqueNamesGenerator, animals } from 'unique-names-generator'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { ErrorInterface, ErrorsHandlerContext } from 'Components/AppContext/Contexts/ErrorsContext'

type Props = {
  contactName: string
  contactUid: string
}

const useSendContactRequest = ({ contactName, contactUid }: Props) => {
  const { firebase, authUser } = useFrequentVariables()
  const handleError = useContext(ErrorsHandlerContext)
  const [contactRequestLoading, setContactRequestLoading] = useState(false)

  const sendContactRequest = async () => {
    if (contactRequestLoading) return
    try {
      setContactRequestLoading(true)
      const randomUserName = uniqueNamesGenerator({
        dictionaries: [animals],
        style: 'capital',
      })
      const newContactRequestCloud = firebase.httpsCallable('newContactRequest')
      await newContactRequestCloud({
        contactUid,
        contactName: contactName || randomUserName,
        authUserName: authUser?.username,
      })
    } catch (err) {
      const error = err as ErrorInterface['errorData']
      handleError({
        errorData: error,
        message: 'There has been some error updating database. Please try again.',
      })

      throw new Error(`There has been some error updating database: ${error}`)
    } finally {
      setContactRequestLoading(false)
    }
  }

  return { sendContactRequest, contactRequestLoading }
}

export default useSendContactRequest

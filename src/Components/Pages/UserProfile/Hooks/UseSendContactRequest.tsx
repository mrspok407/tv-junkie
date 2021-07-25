import { useContext, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { uniqueNamesGenerator, animals } from "unique-names-generator"

type Props = {
  contactName: string
  contactUid: string
}

const useSendContactRequest = ({ contactName, contactUid }: Props) => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const [contactRequestLoading, setContactRequestLoading] = useState(false)

  const sendContactRequest = async () => {
    if (contactRequestLoading) return
    try {
      setContactRequestLoading(true)
      const randomUserName = uniqueNamesGenerator({
        dictionaries: [animals],
        style: "capital"
      })
      const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
      await newContactRequestCloud({
        contactUid,
        contactName: contactName || randomUserName,
        authUserName: authUser?.username
      })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error updating database. Please try again."
      })

      throw new Error(`There has been some error updating database: ${error}`)
    } finally {
      setContactRequestLoading(false)
    }
  }

  return { sendContactRequest, contactRequestLoading }
}

export default useSendContactRequest

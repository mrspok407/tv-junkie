import { useContext, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
// import { _newContactRequest } from "firebaseHttpCallableFunctionsTests"

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
    // const timeStampData = firebase.timeStamp()

    try {
      setContactRequestLoading(true)
      const newContactRequestCloud = firebase.httpsCallable("newContactRequest")
      await newContactRequestCloud({ contactUid, contactName, authUserName: authUser?.username })
      // await _newContactRequest({
      //   data: { contactUid, contactName, timeStamp: timeStampData },
      //   context: { authUser: authUser! },
      //   database: firebase.database()
      // })
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

import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { useContext } from "react"
import { ContactsContext } from "../Components/@Context/ContactsContext"

const useFrequentVariables = () => {
  const firebase = useContext(FirebaseContext)
  const { authUser, newContactsActivity, errors } = useContext(AppContext)
  const contactsContext = useContext(ContactsContext)
  const contactsState = contactsContext?.state!

  return {
    contactsContext,
    contactsState,
    firebase,
    authUser,
    newContactsActivity,
    errors
  }
}

export default useFrequentVariables

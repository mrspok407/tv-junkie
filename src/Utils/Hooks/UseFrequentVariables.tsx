import { useAppSelector } from 'app/hooks'
import { AppContext } from 'Components/AppContext/AppContextHOC'
import { FirebaseContext } from 'Components/Firebase'
import { selectAuthUser } from 'Components/UserAuth/Session/WithAuthentication/authUserSlice'
import { useContext } from 'react'
import { ContactsContext } from '../../Components/Pages/Contacts/Components/@Context/ContactsContext'

const useFrequentVariables = () => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useAppSelector(selectAuthUser)
  const { newContactsActivity, errors, userContentLocalStorage } = useContext(AppContext)
  const contactsContext = useContext(ContactsContext)
  const contactsState = contactsContext?.state!
  const contactsDispatch = contactsContext?.dispatch!

  return {
    contactsContext,
    contactsState,
    contactsDispatch,
    userContentLocalStorage,
    firebase,
    authUser,
    newContactsActivity,
    errors,
  }
}

export default useFrequentVariables

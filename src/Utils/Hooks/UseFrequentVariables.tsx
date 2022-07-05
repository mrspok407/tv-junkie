import { useAppSelector } from 'app/hooks'
import { AppContext } from 'Components/AppContext/ContextsWrapper'
import { FirebaseContext } from 'Components/Firebase'
import { selectAuthUser } from 'Components/UserAuth/Session/Authentication/authUserSlice'
import { useContext } from 'react'
import { ContactsContext } from '../../Components/Pages/Contacts/Components/@Context/ContactsContext'

const useFrequentVariables = () => {
  const firebase = useContext(FirebaseContext)
  const { authUser } = useAppSelector(selectAuthUser)
  const { userContentLocalStorage } = useContext(AppContext)
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
  }
}

export default useFrequentVariables

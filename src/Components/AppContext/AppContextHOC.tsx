/* eslint-disable react/jsx-props-no-spreading */
import React, { createContext, useMemo } from 'react'
import useUserContentLocalStorage from 'Components/UserContent/UseUserContentLocalStorage'
import useFirebase from 'Components/Firebase/UseFirebase'
import useNewContactsActivity from 'Components/Pages/Contacts/Hooks/UseNewContactsActivity'
import useErrors from 'Utils/Hooks/UseErrors/UseErrors'
import useInitializeApp from 'Components/UserContent/UseUserShowsRed/UseInitializeApp'
import App from 'App'
import { AppContextInterface, CONTEXT_INITIAL_STATE } from './@Types'

export const AppContext = createContext<AppContextInterface>(CONTEXT_INITIAL_STATE)

const AppContextHOC = () => {
  useInitializeApp()

  const firebase = useFirebase()
  const userContentLocalStorage = useUserContentLocalStorage()
  const newContactsActivity = useNewContactsActivity()
  const errors = useErrors()

  const ContextValue: AppContextInterface = useMemo(
    () => ({
      userContentLocalStorage,
      // userContent: useUserShows(),
      // userContentHandler: useContentHandler(),
      firebase,
      newContactsActivity,
      errors,
    }),
    [userContentLocalStorage],
  )
  return (
    <AppContext.Provider value={ContextValue}>
      <App />
    </AppContext.Provider>
  )
}

// const AppContextHOC = (Component: any) =>
//   function Comp(props: any) {
//     useInitializeApp()
//     const ContextValue: AppContextInterface = {
//       userContentLocalStorage: useUserContentLocalStorage(),
//       // userContent: useUserShows(),
//       // userContentHandler: useContentHandler(),
//       firebase: useFirebase(),
//       newContactsActivity: useNewContactsActivity(),
//       errors: useErrors(),
//     }
//     return (
//       <AppContext.Provider value={ContextValue}>
//         <Component {...props} />
//       </AppContext.Provider>
//     )
//   }

export default AppContextHOC

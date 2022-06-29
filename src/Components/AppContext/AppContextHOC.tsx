/* eslint-disable react/jsx-props-no-spreading */
import React, { createContext, useMemo, useState } from 'react'
import useUserContentLocalStorage from 'Components/UserContent/UseUserContentLocalStorage'
import useNewContactsActivity from 'Components/Pages/Contacts/Hooks/UseNewContactsActivity'
import useErrors, { ErrorContext } from 'Utils/Hooks/UseErrors/UseErrors'
import useInitializeApp from 'Components/UserContent/UseUserShowsRed/UseInitializeApp'
import App from 'App'
import { AppContextInterface, CONTEXT_INITIAL_STATE } from './@Types'

export const AppContext = createContext<AppContextInterface>(CONTEXT_INITIAL_STATE)

export const TestAppContext = createContext(0)

const AppContextHOC = ({ children }) => {
  useInitializeApp()

  const [counter, setCounter] = useState(0)

  const userContentLocalStorage = useUserContentLocalStorage()
  const newContactsActivity = useNewContactsActivity()
  const errors = useErrors()

  const ContextValue: AppContextInterface = useMemo(
    () => ({
      userContentLocalStorage,
      // userContent: useUserShows(),
      // userContentHandler: useContentHandler(),
      newContactsActivity,
      errors,
    }),
    [userContentLocalStorage],
  )
  return (
    <TestAppContext.Provider value={counter}>
      <button onClick={() => setCounter(counter + 1)}>Counter++</button>
      <AppContext.Provider value={ContextValue}>
        <ErrorContext.Provider value={errors}>
          {children}
          {/* <App /> */}
        </ErrorContext.Provider>
      </AppContext.Provider>
    </TestAppContext.Provider>
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

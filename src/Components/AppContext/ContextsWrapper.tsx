/* eslint-disable react/jsx-props-no-spreading */
import React, { createContext, useEffect, useMemo, useState } from 'react'
import useUserContentLocalStorage from 'Components/UserContent/UseUserContentLocalStorage'
// import useErrors, { ErrorContext } from 'Utils/Hooks/UseErrors/UseErrors'
import useInitializeApp from 'Components/UserContent/UseUserShowsRed/UseInitializeApp'
import Firebase, { FirebaseContext } from 'Components/Firebase'
import { AppContextInterface, CONTEXT_INITIAL_STATE } from './@Types'
import useErrorsContext, { ErrorsContext, ErrorsHandlerContext } from './Contexts/ErrorsContext'
import useContactsActivityContext, { ContactsActivityContext } from './Contexts/ContactsActivityContext'

export const AppContext = createContext<AppContextInterface>(CONTEXT_INITIAL_STATE)

export const TestAppContext = createContext(0)

const ContextsWrapper = ({ children }) => {
  // useInitializeApp()

  const [counter, setCounter] = useState(0)

  const userContentLocalStorage = useUserContentLocalStorage()

  const [errorContextValue, errorHandler] = useErrorsContext()
  const contactsActivityContextValue = useContactsActivityContext()

  useEffect(() => {
    console.log({ errorHandler })
  }, [errorHandler])

  useEffect(() => {
    console.log({ errorContextValue })
  }, [errorContextValue])

  // const ContextValue: AppContextInterface = useMemo(
  //   () => ({
  //     userContentLocalStorage,
  //     // userContent: useUserShows(),
  //     // userContentHandler: useContentHandler(),
  //     newContactsActivity,
  //     // errors,
  //   }),
  //   [userContentLocalStorage],
  // )

  return (
    // <AppContext.Provider value={ContextValue}>
    <ErrorsContext.Provider value={errorContextValue}>
      <ErrorsHandlerContext.Provider value={errorHandler}>
        <ContactsActivityContext.Provider value={contactsActivityContextValue}>
          <button onClick={() => setCounter(counter + 1)}>Counter++</button>
          {children}
          {/* <App /> */}
        </ContactsActivityContext.Provider>
      </ErrorsHandlerContext.Provider>
    </ErrorsContext.Provider>
    // </AppContext.Provider>
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

export default ContextsWrapper

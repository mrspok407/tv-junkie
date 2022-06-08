/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext } from 'react'
import useUserContentLocalStorage from 'Components/UserContent/UseUserContentLocalStorage'
import useUserShows from 'Components/UserContent/UseUserShows/UseUserShows'
import useContentHandler from 'Components/UserContent/UseContentHandler'
import useFirebase from 'Components/Firebase/UseFirebase'
import useNewContactsActivity from 'Components/Pages/Contacts/Hooks/UseNewContactsActivity'
import useErrors from 'Utils/Hooks/UseErrors/UseErrors'
import useInitializeApp from 'Components/UserContent/UseUserShowsRed/UseInitializeApp'
import { AppContextInterface, CONTEXT_INITIAL_STATE } from './@Types'

export const AppContext = createContext<AppContextInterface>(CONTEXT_INITIAL_STATE)

const AppContextHOC = (Component: any) =>
  function Comp(props: any) {
    useInitializeApp()
    const ContextValue: AppContextInterface = {
      userContentLocalStorage: useUserContentLocalStorage(),
      userContent: useUserShows(),
      userContentHandler: useContentHandler(),
      firebase: useFirebase(),
      newContactsActivity: useNewContactsActivity(),
      errors: useErrors(),
    }
    return (
      <AppContext.Provider value={ContextValue}>
        <Component {...props} />
      </AppContext.Provider>
    )
  }

export default AppContextHOC

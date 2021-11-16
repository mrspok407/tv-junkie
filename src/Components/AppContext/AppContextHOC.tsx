import React, { createContext } from "react"
import useUserContentLocalStorage from "Components/UserContent/UseUserContentLocalStorage"
import useUserShows from "Components/UserContent/UseUserShows/UseUserShows"
import useContentHandler from "Components/UserContent/UseContentHandler"
import useFirebase from "Components/Firebase/UseFirebase"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import useNewContactsActivity from "Components/Pages/Contacts/Hooks/UseNewContactsActivity"
import useErrors from "Utils/Hooks/UseErrors"
import { AppContextInterface, CONTEXT_INITIAL_STATE } from "./@Types"

export const AppContext = createContext<AppContextInterface>(CONTEXT_INITIAL_STATE)

const AppContextHOC = (Component: any) =>
  function Comp(props: any) {
    const ContextValue: AppContextInterface = {
      userContentLocalStorage: useUserContentLocalStorage(),
      userContent: useUserShows(),
      userContentHandler: useContentHandler(),
      firebase: useFirebase(),
      authUser: useAuthUser(),
      newContactsActivity: useNewContactsActivity(),
      errors: useErrors()
    }
    return (
      <AppContext.Provider value={ContextValue}>
        <Component {...props} />
      </AppContext.Provider>
    )
  }

export default AppContextHOC

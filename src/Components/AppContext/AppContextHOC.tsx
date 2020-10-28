import React, { createContext } from "react"
import useUserContentLocalStorage from "Components/UserContent/UseUserContentLocalStorage"
import useUserShows from "Components/UserContent/UseUserShows"

interface AppContextInterface {
  userContentLocalStorage: {}
  userContent: {}
}

const AppContext = createContext<AppContextInterface | null>(null)

const AppContextHOC = (Component: any) =>
  function Comp(props: any) {
    // const userContentLocalStorage = useUserContentLocalStorage()
    // const userContent = useUserShows(props.firebase)
    const ContextValue: AppContextInterface = {
      userContentLocalStorage: useUserContentLocalStorage(),
      userContent: useUserShows(props.firebase)
    }
    return (
      <AppContext.Provider value={ContextValue}>
        <Component {...props} />
      </AppContext.Provider>
    )
  }

export default AppContextHOC

export { AppContext }

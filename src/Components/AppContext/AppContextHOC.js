import React, { createContext } from "react"
import useUserContentLocalStorage from "Components/UserContent/UserContentLocalStorageHook"
import useUserShows from "Components/UserContent/UserShowsHook"
import useMergedShows from "Components/UserContent/UserMergedShows"

const AppContext = createContext()

const AppContextHOC = (Component) =>
  function Comp(props) {
    const userContentLocalStorage = useUserContentLocalStorage()
    const userContent = useUserShows(props.firebase)
    const userMergedShows = useMergedShows()

    return (
      <AppContext.Provider value={{ userContentLocalStorage, userContent, userMergedShows }}>
        <Component {...props} />
      </AppContext.Provider>
    )
  }

export default AppContextHOC

export { AppContext }

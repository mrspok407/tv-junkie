import React, { createContext } from "react"
import useUserContentLocalStorage from "Components/UserContent/UseUserContentLocalStorage"
import useUserShows from "Components/UserContent/UseUserShows"

const AppContext = createContext()

const AppContextHOC = (Component) =>
  function Comp(props) {
    const userContentLocalStorage = useUserContentLocalStorage()
    const userContent = useUserShows(props.firebase)

    return (
      <AppContext.Provider value={{ userContentLocalStorage, userContent }}>
        <Component {...props} />
      </AppContext.Provider>
    )
  }

export default AppContextHOC

export { AppContext }

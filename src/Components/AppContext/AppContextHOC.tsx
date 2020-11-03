import React, { createContext } from "react"
import useUserContentLocalStorage from "Components/UserContent/UseUserContentLocalStorage"
import useUserShows from "Components/UserContent/UseUserShows"

interface AppContextInterface {
  userContentLocalStorage: {
    watchLaterMovies: { id: number }[]
    toggleMovieLS: () => void
  }
  userContent: {
    loadingShowsMerging: boolean
    loadingShows: boolean
    loadingNotFinishedShows: boolean
    loadingMovies: boolean
    userShows: { id: number; database: string }[]
    userWillAirEpisodes: {}[]
    userToWatchShows: {}[]
    userMovies: { id: number }[]
  }
}

const AppContext = createContext<AppContextInterface>({
  userContentLocalStorage: {
    watchLaterMovies: [],
    toggleMovieLS: () => {}
  },
  userContent: {
    loadingShowsMerging: true,
    loadingShows: true,
    loadingNotFinishedShows: true,
    loadingMovies: true,
    userShows: [],
    userWillAirEpisodes: [],
    userToWatchShows: [],
    userMovies: []
  }
})

const AppContextHOC = (Component: any) =>
  function Comp(props: any) {
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

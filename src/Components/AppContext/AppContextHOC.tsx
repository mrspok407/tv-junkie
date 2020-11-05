import React, { createContext } from "react"
import useUserContentLocalStorage from "Components/UserContent/UseUserContentLocalStorage"
import useUserShows from "Components/UserContent/UseUserShows"
import useContentHandler from "Components/UserContent/UseContentHandler"

interface ShowInterface {
  id: number
  backdrop_path: string
  first_air_date: string
  genre_ids: number[]
  name: string
  original_name: string
  overview: string
  poster_path: string
  vote_average: string | number
  vote_count: string | number
  allEpisodesWatched: boolean
  database: string
}

interface MovieInterface {
  id: number
  title: string
  release_date: string
  vote_average: string | number
  vote_count: string | number
  backdrop_path: string
  overview: string
  genre_ids: number[]
}

export interface AddShowsToDatabaseOnRegisterArg {
  shows: ShowInterface[]
}

export interface AddShowToDatabaseArg {
  id: number
  show: ShowInterface
  callback?: () => void
}

export interface HandleShowInDatabasesArg {
  id: number
  data: ShowInterface[]
  database: string
  userShows: ShowInterface[]
  callback?: () => void
}

export interface HandleMovieInDatabasesArg {
  id: number
  data: MovieInterface
}

interface toggleMovieLSArg {
  id: number | string
  data: { id: number }[] | { id: number }
}

interface AppContextInterface {
  userContentLocalStorage: {
    watchLaterMovies: { id: number }[]
    toggleMovieLS: ({ id, data }: toggleMovieLSArg) => void
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
  userContentHandler: {
    addShowsToDatabaseOnRegister: ({ shows }: AddShowsToDatabaseOnRegisterArg) => void
    addShowToDatabase: ({ id, show, callback }: AddShowToDatabaseArg) => void
    handleShowInDatabases: ({ id, data, database, userShows, callback }: HandleShowInDatabasesArg) => void
    handleMovieInDatabases: ({ id, data }: HandleMovieInDatabasesArg) => void
  }
}

export const AppContext = createContext<AppContextInterface>({
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
  },
  userContentHandler: {
    addShowsToDatabaseOnRegister: () => {},
    addShowToDatabase: () => {},
    handleShowInDatabases: () => {},
    handleMovieInDatabases: () => {}
  }
})

const AppContextHOC = (Component: any) =>
  function Comp(props: any) {
    const ContextValue: AppContextInterface = {
      userContentLocalStorage: useUserContentLocalStorage(),
      userContent: useUserShows(props.firebase),
      userContentHandler: useContentHandler()
    }
    return (
      <AppContext.Provider value={ContextValue}>
        <Component {...props} />
      </AppContext.Provider>
    )
  }

export default AppContextHOC

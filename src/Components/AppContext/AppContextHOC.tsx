import React, { createContext } from "react"
import useUserContentLocalStorage from "Components/UserContent/UseUserContentLocalStorage"
import useUserShows, {
  UserMoviesInterface,
  UserShowsInterface,
  UserWillAirEpisodesInterface
} from "Components/UserContent/UseUserShows/UseUserShows"
import useContentHandler, { LOADING_ADDING_TO_DATABASE_INITIAL } from "Components/UserContent/UseContentHandler"
import useFirebase from "Components/Firebase/UseFirebase"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import { UserToWatchShowsInterface } from "Components/UserContent/UseUserShows/Hooks/UseGetUserToWatchShows"
import { HandleListenersArg } from "Components/Pages/Detailes/FirebaseHelpers/UseHandleListeners"

export interface ShowInterface {
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
  finished: boolean
}

export interface MovieInterface {
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
  shows: ContentDetailes[]
  uid: string
}

export interface AddShowToDatabaseArg {
  id: number
  show: ContentDetailes
  database: string
  handleListeners?: ({ id, status, handleLoading }: HandleListenersArg) => void
}

export interface HandleShowInDatabasesArg {
  id: number
  data: ContentDetailes
  database: string
  userShows: ContentDetailes[]
  handleListeners?: ({ id, status, handleLoading }: HandleListenersArg) => void
}

export interface HandleMovieInDatabasesArg {
  id: number
  data: MovieInterface
  onRegister?: boolean
  userOnRegister?: { email: string; uid: string; displayName: string }
}

export interface ToggleMovieLSArg {
  id: number
  data: ContentDetailes[] | ContentDetailes
}

export interface AppContextInterface {
  userContentLocalStorage: {
    watchLaterMovies: ContentDetailes[]
    watchingShows: ContentDetailes[]
    toggleMovieLS: ({ id, data }: ToggleMovieLSArg) => void
    clearContentState: () => void
    addShowLS: ({ id, data }: { id: number; data: ContentDetailes }) => void
    removeShowLS: ({ id }: { id: number }) => void
  }
  userContent: {
    loadingShows: boolean
    loadingNotFinishedShows: boolean
    loadingMovies: boolean
    userShows: UserShowsInterface[]
    userWillAirEpisodes: UserWillAirEpisodesInterface[]
    userToWatchShows: UserToWatchShowsInterface[]
    userMovies: ContentDetailes[]
    resetContentState: () => void
    handleUserMoviesOnClient: ({ id, data }: { id: number; data?: UserMoviesInterface }) => void
    handleUserShowsOnClient: ({ id, database }: { id: number; database: string }) => void
  }
  userContentHandler: {
    addShowsToDatabaseOnRegister: ({ shows }: AddShowsToDatabaseOnRegisterArg) => void
    addShowToDatabase: ({ id, show, handleListeners }: AddShowToDatabaseArg) => void
    handleShowInDatabases: ({ id, data, database, userShows }: HandleShowInDatabasesArg) => void
    handleMovieInDatabases: ({ id, data }: HandleMovieInDatabasesArg) => void
    handleLoadingShowsOnRegister: (isLoading: boolean) => void
    loadingAddShowToDatabase: {
      watchingShows: boolean
      droppedShows: boolean
      willWatchShows: boolean
      notWatchingShows: boolean
      loading: boolean
    }
    loadingShowsOnRegister: boolean
  }
  firebase: FirebaseInterface
  authUser: AuthUserInterface | null
}

export const CONTEXT_INITIAL_STATE = {
  userContentLocalStorage: {
    watchLaterMovies: [],
    watchingShows: [],
    toggleMovieLS: () => {},
    clearContentState: () => {},
    addShowLS: () => {},
    removeShowLS: () => {}
  },
  userContent: {
    loadingShows: true,
    loadingNotFinishedShows: true,
    loadingMovies: true,
    userShows: [],
    userWillAirEpisodes: [],
    userToWatchShows: [],
    userMovies: [],
    resetContentState: () => {},
    handleUserMoviesOnClient: () => {},
    handleUserShowsOnClient: () => {}
  },
  userContentHandler: {
    addShowsToDatabaseOnRegister: () => {},
    addShowToDatabase: () => {},
    handleShowInDatabases: () => {},
    handleMovieInDatabases: () => {},
    handleLoadingShowsOnRegister: () => {},
    loadingAddShowToDatabase: LOADING_ADDING_TO_DATABASE_INITIAL,
    loadingShowsOnRegister: false
  },
  firebase: {},
  authUser: { uid: "", email: "", emailVerified: false }
}

export const AppContext = createContext<AppContextInterface>(CONTEXT_INITIAL_STATE)

const AppContextHOC = (Component: any) =>
  function Comp(props: any) {
    const ContextValue: AppContextInterface = {
      userContentLocalStorage: useUserContentLocalStorage(),
      userContent: useUserShows(),
      userContentHandler: useContentHandler(),
      firebase: useFirebase(),
      authUser: useAuthUser()
    }
    return (
      <AppContext.Provider value={ContextValue}>
        <Component {...props} />
      </AppContext.Provider>
    )
  }

export default AppContextHOC

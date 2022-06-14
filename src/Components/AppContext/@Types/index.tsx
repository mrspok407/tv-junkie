import {
  UserMoviesInterface,
  ShowFullDataStoreState,
  UserWillAirEpisodesInterface,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import { LOADING_ADDING_TO_DATABASE_INITIAL } from 'Components/UserContent/UseContentHandler'
import { FirebaseInterface, FIREBASE_INITIAL_STATE } from 'Components/Firebase/FirebaseContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { UserToWatchShowsInterface } from 'Components/UserContent/UseUserShows/Hooks/UseGetUserToWatchShows'

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
  genre_ids: number[] | undefined
}

export interface AddShowsToDatabaseOnRegisterArg {
  shows: MainDataTMDB[]
  uid: string
}

export interface AddShowToDatabaseArg {
  id: number
  show: MainDataTMDB
  database: string
}

export interface HandleShowInDatabasesArg {
  id: number
  data: MainDataTMDB
  database: string
  userShows: MainDataTMDB[]
}

export interface HandleMovieInDatabasesArg {
  id: number
  data: MovieInterface
  onRegister?: boolean
  userOnRegister?: { email: string; uid: string; displayName: string }
}

export interface ToggleDataLS {
  id: number
  data: MainDataTMDB
  database: string
}

export interface AppContextInterface {
  userContentLocalStorage: {
    watchLaterMovies: MainDataTMDB[]
    watchingShows: ShowFullDataStoreState[]
    toggleMovieLS: ({ id, data }: ToggleDataLS) => void
    clearContentState: () => void
    toggleShowLS: ({ id, data }: ToggleDataLS) => void
  }
  userContent: {
    loadingShows: boolean
    loadingNotFinishedShows: boolean
    loadingMovies: boolean
    userShows: ShowFullDataStoreState[]
    userWillAirEpisodes: UserWillAirEpisodesInterface[]
    userToWatchShows: UserToWatchShowsInterface[]
    userMovies: MainDataTMDB[]
    resetContentState: () => void
    handleUserMoviesOnClient: ({ id, data }: { id: number; data?: UserMoviesInterface }) => void
  }
  userContentHandler: {
    addShowsToDatabaseOnRegister: ({ shows }: AddShowsToDatabaseOnRegisterArg) => void
    addShowToDatabase: ({ id, show }: AddShowToDatabaseArg) => void
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
  newContactsActivity: boolean | null
  errors: {
    error: {
      errorData: any
      message: string
    } | null
    handleError: ({ errorData, message }: { errorData?: any; message: string }) => void
  }
}

export const CONTEXT_INITIAL_STATE = {
  userContentLocalStorage: {
    watchLaterMovies: [],
    watchingShows: [],
    toggleMovieLS: () => {},
    clearContentState: () => {},
    addShowLS: () => {},
    removeShowLS: () => {},
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
    handleUserShowsOnClient: () => {},
  },
  userContentHandler: {
    addShowsToDatabaseOnRegister: () => {},
    addShowToDatabase: () => {},
    handleShowInDatabases: () => {},
    handleMovieInDatabases: () => {},
    handleLoadingShowsOnRegister: () => {},
    loadingAddShowToDatabase: LOADING_ADDING_TO_DATABASE_INITIAL,
    loadingShowsOnRegister: false,
  },
  firebase: FIREBASE_INITIAL_STATE,
  newContactsActivity: false,
  errors: { error: null, handleError: () => {} },
}

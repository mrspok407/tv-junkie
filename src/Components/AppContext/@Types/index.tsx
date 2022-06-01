import {
  UserMoviesInterface,
  UserShowsInterface,
  UserWillAirEpisodesInterface,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import { LOADING_ADDING_TO_DATABASE_INITIAL } from 'Components/UserContent/UseContentHandler'
import { FirebaseInterface, FIREBASE_INITIAL_STATE } from 'Components/Firebase/FirebaseContext'
import { DataTMDBAPIInterface } from 'Utils/Interfaces/DataTMDBAPIInterface'
import { UserToWatchShowsInterface } from 'Components/UserContent/UseUserShows/Hooks/UseGetUserToWatchShows'
import { HandleListenersArg } from 'Components/Pages/Detailes/FirebaseHelpers/UseHandleListeners'
import { SnapshotVal } from './generics'

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
  shows: DataTMDBAPIInterface[]
  uid: string
}

export interface AddShowToDatabaseArg {
  id: number
  show: DataTMDBAPIInterface
  database: string
  handleListeners?: ({ id, status, handleLoading }: HandleListenersArg) => void
}

export interface HandleShowInDatabasesArg {
  id: number
  data: DataTMDBAPIInterface
  database: string
  userShows: DataTMDBAPIInterface[]
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
  data: DataTMDBAPIInterface[] | DataTMDBAPIInterface
}

export interface ErrorsInterface {
  error: any
  handleError: ({ errorData, message }: { errorData?: any; message: string }) => void
}

export interface AppContextInterface {
  userContentLocalStorage: {
    watchLaterMovies: DataTMDBAPIInterface[]
    watchingShows: UserShowsInterface[]
    toggleMovieLS: ({ id, data }: ToggleMovieLSArg) => void
    clearContentState: () => void
    addShowLS: ({ id, data }: { id: number; data: DataTMDBAPIInterface }) => void
    removeShowLS: ({ id }: { id: number }) => void
  }
  userContent: {
    loadingShows: boolean
    loadingNotFinishedShows: boolean
    loadingMovies: boolean
    userShows: UserShowsInterface[]
    userWillAirEpisodes: UserWillAirEpisodesInterface[]
    userToWatchShows: UserToWatchShowsInterface[]
    userMovies: DataTMDBAPIInterface[]
    resetContentState: () => void
    handleUserMoviesOnClient: ({ id, data }: { id: number; data?: UserMoviesInterface }) => void
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
  newContactsActivity: boolean | null
  errors: ErrorsInterface
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
  errors: { error: {}, handleError: () => {} },
}

export type { SnapshotVal }

import { FirebaseInterface, FIREBASE_INITIAL_STATE } from 'Components/Firebase/FirebaseContext'
import { UserShowStatuses } from 'Components/UserContent/UseUserShowsRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

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
  database: UserShowStatuses
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
  database: UserShowStatuses
}

export interface HandleShowInDatabasesArg {
  id: number
  data: MainDataTMDB
  database: UserShowStatuses
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
  database: UserShowStatuses
}

export interface AppContextInterface {
  userContentLocalStorage: {
    watchLaterMovies: MainDataTMDB[]
    watchingShows: MainDataTMDB[]
    toggleMovieLS: ({ id, data }: ToggleDataLS) => void
    clearContentState: () => void
    toggleShowLS: ({ id, data }: ToggleDataLS) => void
  }
  // userContent: {
  //   loadingShows: boolean
  //   loadingNotFinishedShows: boolean
  //   loadingMovies: boolean
  //   userShows: ShowFullDataStoreState[]
  //   userWillAirEpisodes: UserWillAirEpisodesInterface[]
  //   userToWatchShows: UserToWatchShowsInterface[]
  //   userMovies: MainDataTMDB[]
  //   resetContentState: () => void
  // }
  // userContentHandler: {
  //   // addShowsToDatabaseOnRegister: ({ shows }: AddShowsToDatabaseOnRegisterArg) => void
  //   // handleLoadingShowsOnRegister: (isLoading: boolean) => void
  //   // loadingAddShowToDatabase: {
  //   //   watchingShows: boolean
  //   //   droppedShows: boolean
  //   //   willWatchShows: boolean
  //   //   notWatchingShows: boolean
  //   //   loading: boolean
  //   // }
  //   // loadingShowsOnRegister: boolean
  // }
  firebase: FirebaseInterface
  newContactsActivity: boolean | null
  errors: {
    error: {
      errorData?: unknown
      message: string
    } | null
    handleError: ({ errorData, message }: { errorData?: unknown; message: string }) => void
  }
}

export const CONTEXT_INITIAL_STATE = {
  userContentLocalStorage: {
    watchLaterMovies: [],
    watchingShows: [],
    toggleMovieLS: () => {},
    clearContentState: () => {},
    toggleShowLS: () => {},
  },
  // userContent: {
  //   loadingShows: true,
  //   loadingNotFinishedShows: true,
  //   loadingMovies: true,
  //   userShows: [],
  //   userWillAirEpisodes: [],
  //   userToWatchShows: [],
  //   userMovies: [],
  //   resetContentState: () => {},
  //   handleUserShowsOnClient: () => {},
  // },
  // userContentHandler: {
  //   // addShowsToDatabaseOnRegister: () => {},
  //   // handleLoadingShowsOnRegister: () => {},
  //   loadingAddShowToDatabase: LOADING_ADDING_TO_DATABASE_INITIAL,
  //   loadingShowsOnRegister: false,
  // },
  firebase: FIREBASE_INITIAL_STATE,
  newContactsActivity: false,
  errors: { error: null, handleError: () => {} },
}

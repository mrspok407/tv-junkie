import { ErrorInterface } from 'Components/AppContext/Contexts/ErrorsContext'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

export type UserMovieStatuses = 'watchLaterMovies' | 'finished'

export interface MovieFullDataStoreState extends MainDataTMDB {
  [key: string]: any
}

export interface UserMoviesStoreState {
  data: {
    ids: number[]
    info: {
      [key: string]: MovieFullDataStoreState
    }
    timeStamps: {
      [key: string]: number
    }
  }
  initialLoading: boolean
  loadingNewMovie: UserMovieStatuses | false
  error: ErrorInterface | null
}

export const USER_MOVIES_INITIAL_STATE: UserMoviesStoreState = {
  data: {
    ids: [],
    info: {},
    timeStamps: {},
  },
  initialLoading: true,
  loadingNewMovie: false,
  error: null,
}

export const USER_MOVIES_RESET_STATE = {
  ...USER_MOVIES_INITIAL_STATE,
  initialLoading: false,
  loadingNewMovie: false as const,
}

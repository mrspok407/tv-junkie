import { ErrorInterface } from 'Components/AppContext/Contexts/ErrorsContext'
import { MovieInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

export type UserMovieStatuses = 'watchLaterMovies' | 'finished'

export interface UserMoviesStoreState {
  data: {
    ids: number[]
    info: {
      [key: string]: MovieInfoFromUserDatabase
    }
    timeStamps: {
      [key: string]: number
    }
  }
  initialLoading: boolean
  loadingMovie: boolean
  error: ErrorInterface | null
}

export const USER_MOVIES_INITIAL_STATE: UserMoviesStoreState = {
  data: {
    ids: [],
    info: {},
    timeStamps: {},
  },
  initialLoading: true,
  loadingMovie: false,
  error: null,
}

export const USER_MOVIES_RESET_STATE = {
  ...USER_MOVIES_INITIAL_STATE,
  initialLoading: false,
  loadingMovie: false,
}

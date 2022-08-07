import { ErrorInterface } from 'Components/AppContext/Contexts/ErrorsContext'
import { MovieInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'

export type UserMovieStatuses = 'watchLaterMovies' | 'finished'

export interface UserMoviesStoreState {
  data: {
    ids: number[]
    info: {
      [key: string]: MovieInfoFromUserDatabase | undefined
    }
    timeStamps: {
      [key: string]: number
    }
  }
  initialLoading: boolean
  loadingMovie: boolean
  error: ErrorInterface | null
}

export type MovieInfoStoreState = UserMoviesStoreState['data']['info'][keyof UserMoviesStoreState['data']['info']]

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

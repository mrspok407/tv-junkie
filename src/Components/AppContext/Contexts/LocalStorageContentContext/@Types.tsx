import { UserShowStatuses } from 'Components/UserContent/UseUserShowsRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'

export const LOCAL_STORAGE_KEY_WATCHING_SHOWS = 'watchingShowsLocalS'
export const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = 'watchLaterMoviesLocalS'

export interface LocalStorageContentInt {
  data: {
    watchingShows: MainDataTMDB[]
    watchLaterMovies: MainDataTMDB[]
  }
  handlers: {
    toggleMovie: ({ id, data }: HandlersLocalStorageInt) => void
    toggleShow: ({ id, data, userShowStatus }: HandlersLocalStorageInt) => void
    clearLocalStorageContent: () => void
  }
}

export interface HandlersLocalStorageInt {
  id: number
  data: MainDataTMDB
  userShowStatus?: UserShowStatuses
}

export const INITIAL_VALUE_LOCAL_STORAGE_CONTENT = {
  data: {
    watchingShows: [],
    watchLaterMovies: [],
  },
  handlers: {
    toggleMovie: () => {},
    toggleShow: () => {},
    clearLocalStorageContent: () => {},
  },
}

export interface LocalStorageProviderInt extends LocalStorageContentInt {
  children: React.ReactNode
}

import { ErrorInterface } from 'Components/AppContext/Contexts/ErrorsContext'
import { SeasonFromUserDatabase, SingleEpisodeFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { EpisodesTMDB, MainDataTMDB, SingleEpisodeTMDB } from 'Utils/@TypesTMDB'

export type UserShowStatuses = 'watchingShows' | 'droppedShows' | 'willWatchShows' | 'notWatchingShows' | ''
export const showStatusMapper = {
  watchingShows: 'Watching',
  droppedShows: 'Drop',
  willWatchShows: 'Will watch',
  notWatchingShows: 'Not watching',
}

export interface ShowFullDataStoreState extends MainDataTMDB {
  allEpisodesWatched: boolean
  database: UserShowStatuses
  episodes: EpisodesStoreState[]
  episodesFetched: boolean | undefined
  finished: boolean
  key: string
  lastUpdatedInDatabase: number
  timeStamp: number
  userRating: string | undefined
}

export interface UserMoviesInterface extends MainDataTMDB {
  timeStamp?: number
}

export interface SingleEpisodeByMonthInterface {
  air_date: any
  episode_number?: number
  show: string
  showId: number
}
export interface UserWillAirEpisodesInterface {
  episodes: SingleEpisodeByMonthInterface[]
  month: string
}

export interface SingleEpisodeStoreState extends SingleEpisodeTMDB, SingleEpisodeFromUserDatabase {}
export interface EpisodesStoreState extends EpisodesTMDB, SeasonFromUserDatabase {
  episodes: SingleEpisodeStoreState[]
}

export interface UserShowsStoreState {
  data: {
    ids: number[]
    info: {
      [key: string]: ShowFullDataStoreState | undefined
    }
    episodes: {
      [key: string]: EpisodesStoreState[] | undefined
    }
    timeStamps: {
      [key: string]: number
    }
  }
  initialLoading: boolean
  loadingNewShow: UserShowStatuses | false
  error: ErrorInterface | null
}

export const USER_SHOWS_INITIAL_STATE: UserShowsStoreState = {
  data: {
    ids: [],
    info: {},
    episodes: {},
    timeStamps: {},
  },
  initialLoading: true,
  loadingNewShow: false,
  error: null,
}

export const USER_SHOWS_RESET_STATE = {
  ...USER_SHOWS_INITIAL_STATE,
  initialLoading: false,
  loadingNewShow: false as const,
}

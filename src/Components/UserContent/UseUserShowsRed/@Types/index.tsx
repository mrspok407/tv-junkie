import { ErrorInterface } from 'Components/AppContext/Contexts/ErrorsContext'
import { SeasonFromUserDatabase, SingleEpisodeFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { EpisodesTMDB, MainDataTMDB, SingleEpisodeTMDB } from 'Utils/@TypesTMDB'

export type UserShowStatuses = 'watchingShows' | 'droppedShows' | 'willWatchShows' | 'notWatchingShows' | ''
export type UserShowStatusReadable = 'Watching' | 'Drop' | 'Will watch' | 'Not watching'
export const showStatusMapper = {
  watchingShows: 'Watching' as const,
  droppedShows: 'Drop' as const,
  willWatchShows: 'Will watch' as const,
  notWatchingShows: 'Not watching' as const,
}

export interface ShowFullDataStoreState extends MainDataTMDB {
  allEpisodesWatched: boolean
  allReleasedEpisodesWatched: boolean | null
  database: UserShowStatuses
  episodes: EpisodesStoreState[]
  episodesFetched: boolean | undefined
  finished: boolean
  key: string
  timeStamp: number
  userRating: number
}

export interface SingleEpisodeByMonthInterface {
  air_date: string
  episode_number?: number
  id: number
  name?: string
  season_number?: number
  show: string
  showId: number
}
export interface UserWillAirEpisodesInterface {
  episodes: SingleEpisodeByMonthInterface[]
  month: string
}

export interface SingleEpisodeStoreState extends SingleEpisodeTMDB, SingleEpisodeFromUserDatabase {
  episode_number: number
  season_number: number
  originalEpisodeIndex: number
  originalSeasonIndex: number
}
export interface EpisodesStoreState extends EpisodesTMDB, SeasonFromUserDatabase {
  episodes: SingleEpisodeStoreState[]
  allReleasedEpisodesWatched: boolean | null
  originalSeasonIndex: number
}

export interface UserShowsStoreState {
  data: {
    ids: number[]
    info: {
      [key: string]: ShowFullDataStoreState
    }
    episodes: {
      [key: string]: EpisodesStoreState[]
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

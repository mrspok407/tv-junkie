import { SeasonFromUserDatabase, SingleEpisodeFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { EpisodesTMDB, MainDataTMDB, SingleEpisodeTMDB } from 'Utils/@TypesTMDB'
import { ErrorInterface } from 'Utils/Hooks/UseErrors/UseErrors'

export interface ShowInfoStoreState extends MainDataTMDB {
  allEpisodesWatched: boolean
  database: string
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
      [key: string]: ShowInfoStoreState
    }
    episodes: {
      [key: string]: EpisodesStoreState[]
    }
    timeStamps: {
      [key: string]: number
    }
  }
  loading: boolean
  error: ErrorInterface | null
}

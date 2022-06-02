import { EpisodesFromFireDatabase } from 'Components/Firebase/@Types'
import { DataTMDBAPIInterface } from 'Utils/Interfaces/DataTMDBAPIInterface'

export interface UserShowsInterface extends DataTMDBAPIInterface {
  allEpisodesWatched: boolean
  database: string
  episodes: EpisodesFromFireDatabase[]
  episodesFetched: boolean | undefined
  finished: boolean
  info: { database: string }
  key: string
  lastUpdatedInDatabase: number
  lastUpdatedInUser: number
  timeStamp: number
  userRating: string | string
}

export interface UserMoviesInterface extends DataTMDBAPIInterface {
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

export interface UserShowsState {
  data: {
    ids: number[]
    info: {
      [key: string]: UserShowsInterface
    }
    episodes: {
      [key: string]: EpisodesFromFireDatabase[]
    }
    timeStamps: {
      [key: string]: number
    }
  }
  loading: boolean
  error: any
}

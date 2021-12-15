import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

export interface UserShowsInterface extends ContentDetailes {
  allEpisodesWatched: boolean
  database: string
  finished: boolean
  timeStamp: number
  userRating: string | string
  episodes: SeasonEpisodesFromDatabaseInterface[]
  episodesFetched: boolean | undefined
  lastUpdatedInDatabase: number
  lastUpdatedInUser: number
  info: { database: string }
  key: string
}

export interface SingleEpisodeInterface {
  [key: string]: number | string | boolean | null | undefined
  id?: number
  userRating: number
  watched: boolean
  air_date: string | null
  episode_number?: number
  season_number?: number
}
export interface SeasonEpisodesFromDatabaseInterface {
  episodes: SingleEpisodeInterface[]
  air_date?: string
  poster_path?: string
  episode_count?: number
  season_number: number
  userRating: number | string
  name?: string
  id: number
}

export interface UserMoviesInterface extends ContentDetailes {
  timeStamp?: number
}

export interface SingleEpisodeByMonthInterface {
  episode_number?: number
  show: string
  air_date: any
  showId: number
}
export interface UserWillAirEpisodesInterface {
  month: string
  episodes: SingleEpisodeByMonthInterface[]
}

export interface UserShowsState {
  data: {
    ids: number[]
    info: {
      [key: string]: UserShowsInterface
    }
    episodes: {
      [key: string]: SeasonEpisodesFromDatabaseInterface[]
    }
    timeStamps: {
      [key: string]: number
    }
  }
  initialLoading: boolean
  error: any
}

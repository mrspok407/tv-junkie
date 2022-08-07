/* eslint-disable @typescript-eslint/no-empty-interface */
import { UserShowStatuses } from 'Components/UserContent/UseUserShowsRed/@Types'
import { EpisodesTMDB, MainDataTMDB, MAINDATA_TMDB_INITIAL, SingleEpisodeTMDB } from 'Utils/@TypesTMDB'

export interface ShowFullDataFireDatabase {
  info: ShowInfoFireDatabase
  episodes: EpisodesTMDB[]
  id: string
  status: string
  usersWatching: number
}

export interface ShowInfoFireDatabase extends MainDataTMDB {
  lastUpdatedInDatabase: number
}

export const SHOW_FULL_DATA_FIRE_DATABASE_INITIAL = {
  info: {
    ...MAINDATA_TMDB_INITIAL,
    lastUpdatedInDatabase: 0,
  },
  episodes: [],
  id: '',
  status: '',
  usersWatching: 0,
}

export interface EpisodesFromFireDatabase extends EpisodesTMDB {}

export interface SingleEpisodeFromFireDatabase extends SingleEpisodeTMDB {
  episode_number: number
  season_number: number
}

export interface EpisodesFromUserDatabase {
  episodes: SeasonFromUserDatabase[]
  info: {
    allEpisodesWatched: boolean
    database: UserShowStatuses
    finished: boolean
    isAllWatched_database: string
  }
}

export interface SingleEpisodeFromUserDatabase {
  air_date: string
  userRating: number
  watched: boolean
}

export interface SeasonFromUserDatabase {
  episodes: SingleEpisodeFromUserDatabase[]
  season_number: number
  userRating: number
}

export interface ShowInfoFromUserDatabase {
  allEpisodesWatched: boolean
  database: UserShowStatuses
  finished: boolean
  firstAirDate: string
  id: number
  key: string
  name: string
  status: string
  timeStamp: number
  userRating: number
}

export interface MovieInfoFromUserDatabase {
  backdrop_path: string | null
  finished: boolean | undefined
  genres: { id: number; name: string }[]
  id: number
  key: string
  overview: string
  release_date: string
  timeStamp: number
  title: string
  userRating: number
  vote_average: number
  vote_count: number
}

export interface SnapshotVal<Type> {
  val(): Type | null
  key: string
}

export const setSnapshotValInitial = <T,>(initialState: T) => {
  return { val: () => initialState, key: '' }
}

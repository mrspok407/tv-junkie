/* eslint-disable @typescript-eslint/no-empty-interface */
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

export const EPISODES_FROM_FIRE_DATABASE_INITIAL = {
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

export interface SingleEpisodeFromFireDatabase extends SingleEpisodeTMDB {}

export interface EpisodesFromUserDatabase {
  episodes: SeasonFromUserDatabase[]
  info: {
    allEpisodesWatched: boolean
    database: string
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
  database: string
  finished: boolean
  firstAirDate: string
  id: number
  name: string
  status: string
  timeStamp: number
}

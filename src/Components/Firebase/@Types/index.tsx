/* eslint-disable @typescript-eslint/no-empty-interface */
import { EpisodesTMDB, MainDataTMDB, MAINDATA_TMDB_INITIAL, SingleEpisodeTMDB } from 'Utils/@TypesTMDB'

export interface ShowFullDataFireDatabase {
  info: MainDataTMDB
  episodes: EpisodesTMDB
  id: string
  status: string
  usersWatching: number
}

export const EPISODES_FROM_FIRE_DATABASE_INITIAL = {
  info: MAINDATA_TMDB_INITIAL,
  episodes: {
    air_date: '',
    episode_count: 0,
    episodes: [],
    id: 0,
    name: '',
    poster_path: '',
    season_number: 0,
    userRating: 0,
  },
  id: '',
  status: '',
  usersWatching: 0,
}

export interface EpisodesFromFireDatabase extends EpisodesTMDB {}

export interface SingleEpisodeFromFireDatabase extends SingleEpisodeTMDB {}

export interface EpisodesFromUserDatabase {
  episodes: {
    episodes: { air_date: string; userRating: number; watched: boolean }[]
    season_number: number
    userRating: number
  }[]
  info: {
    allEpisodesWatched: boolean
    database: string
    finished: boolean
    isAllWatched_database: string
  }
}

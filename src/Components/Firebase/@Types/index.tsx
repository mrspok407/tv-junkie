export interface ShowFullDataFireDatabase {}

export interface EpisodesFromFireDatabase {
  air_date?: string
  episode_count?: number
  episodes: SingleEpisodeFromFireDatabase[]
  id: number
  name?: string
  poster_path?: string
  season_number: number
  userRating?: number | string
}

export interface SingleEpisodeFromFireDatabase {
  [key: string]: number | string | boolean | null | undefined
  air_date: string | null
  episode_number?: number
  id?: number
  name?: string
  season_number?: number
  userRating?: number
  watched?: boolean
}

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

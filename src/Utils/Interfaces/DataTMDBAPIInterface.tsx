import { EpisodesFromFireDatabase, SingleEpisodeFromFireDatabase } from 'Components/Firebase/@Types'

export interface SeasonsFromAPI {
  air_date?: string
  episode_count?: number
  episodes: SingleEpisodeFromFireDatabase[]
  id: number
  name?: string
  overview?: string
  poster_path?: string
  season_number: number
}

export interface DataTMDBAPIInterface {
  [key: string]: string | string[] | number | number[] | Record<string, any> | undefined | boolean | null
  allEpisodesWatched: boolean
  backdrop_path: string | null
  budget: number
  database: string
  episode_run_time: number[]
  first_air_date: string
  genre_ids: number[]
  genres: { id: number; name: string }[]
  id: number
  imdb_id: string | null
  known_for: {
    media_type: string
    original_title: string
    name: string
    release_date: string
    first_air_date: string
    id: number
  }[]
  known_for_department: string
  last_air_date: string
  media_type?: string
  name: string
  networks: { name: string; id: number; logo_path: string | null; origin_country: string }[]
  number_of_seasons: number
  origin_country: string[]
  original_language: string
  original_name: string
  original_title: string
  overview: string
  poster_path: string | null
  production_companies: { name: string; id: number; logo_path: string | null; origin_country: string }[]
  profile_path: string | null
  release_date: string
  runtime: number | null
  seasons: EpisodesFromFireDatabase[]
  seasonsFromAPI: SeasonsFromAPI[]
  similar?: { results: Record<string, unknown>[] }[]
  similar_movies?: { results: Record<string, unknown>[] }[]
  status: string
  tagline: string
  title: string
  torrents: { hash: string; quality: string }[]
  userWatching?: boolean
  vote_average: number
  vote_count: number
}

const DATA_TMDBAPI_INITIAL: DataTMDBAPIInterface = {
  allEpisodesWatched: false,
  backdrop_path: '-',
  budget: 0,
  database: '',
  episode_run_time: [0],
  first_air_date: '-',
  genre_ids: [],
  genres: [],
  id: 0,
  imdb_id: '',
  known_for: [],
  known_for_department: '-',
  last_air_date: '-',
  media_type: '-',
  name: '-',
  networks: [],
  number_of_seasons: 0,
  origin_country: [],
  original_language: '-',
  original_name: '-',
  original_title: '-',
  overview: '-',
  poster_path: '-',
  production_companies: [],
  profile_path: '-',
  release_date: '-',
  runtime: 0,
  seasons: [],
  seasonsFromAPI: [],
  status: '-',
  tagline: '-',
  title: '-',
  torrents: [{ hash: '', quality: '' }],
  vote_average: 0,
  vote_count: 0,
}

export { DATA_TMDBAPI_INITIAL }

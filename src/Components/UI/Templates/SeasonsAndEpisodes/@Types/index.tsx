import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'

export interface EpisodesDataInterface {
  name?: string
  id: number
  seasonId?: number
  air_date?: string
  season_number: number
  episode_count?: number
  poster_path?: string
  episodes: SingleEpisodeFromFireDatabase[]
}

export interface CurrentlyOpenSeasons {
  seasonId: number
  seasonNum: number
}

export interface ShowEpisodesFromAPIInterface {
  seasonId: number
  id?: number
  episodes: SingleEpisodeFromFireDatabase[]
}

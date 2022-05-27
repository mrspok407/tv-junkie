import { SingleEpisodeInterface } from 'Components/UserContent/UseUserShowsRed/@Types'

export interface EpisodesDataInterface {
  name?: string
  id: number
  seasonId?: number
  air_date?: string
  season_number: number
  episode_count?: number
  poster_path?: string
  episodes: SingleEpisodeInterface[]
}

export interface CurrentlyOpenSeasons {
  seasonId: number
  seasonNum: number
}

export interface ShowEpisodesFromAPIInterface {
  seasonId: number
  id?: number
  episodes: SingleEpisodeInterface[]
}

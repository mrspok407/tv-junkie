import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import { SeasonTMDB } from 'Utils/@TypesTMDB'

export interface CurrentlyOpenSeasons {
  seasonId: number
  seasonNum: number
}

export interface ShowEpisodesFromAPIInt {
  showTitle: string
  seasonId?: number
  id?: number
  episodes: SingleEpisodeFromFireDatabase[]
}

export interface SeasonFullData extends ShowEpisodesFromAPIInt {
  air_date?: string
  episode_count?: number
  id: number
  name?: string
  overview?: string
  poster_path?: string
  season_number: number
}

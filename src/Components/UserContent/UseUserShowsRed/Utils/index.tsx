import { EpisodesStoreState, SingleEpisodeStoreState } from '../@Types'
import { releasedEpisodesToOneArray } from './episodesOneArrayModifiers'

export const updateIsEpisodesWatched = (showEpisodes: EpisodesStoreState[]) => {
  let allReleasedEpisodesWatched: boolean | null = true
  let modifiedData: typeof showEpisodes = []

  if (!Array.isArray(showEpisodes)) {
    allReleasedEpisodesWatched = null
    return [modifiedData, allReleasedEpisodesWatched] as const
  }

  modifiedData = showEpisodes.reduce((acc, season) => {
    const isAnyReleasedEpisodeNotWatched = releasedEpisodesToOneArray<SingleEpisodeStoreState>([season]).some(
      (episode) => !episode.watched,
    )
    if (isAnyReleasedEpisodeNotWatched) {
      allReleasedEpisodesWatched = false
    }
    acc.push({ ...season, allReleasedEpisodesWatched: !isAnyReleasedEpisodeNotWatched })
    return acc
  }, [] as EpisodesStoreState[])
  return [modifiedData, allReleasedEpisodesWatched] as const
}

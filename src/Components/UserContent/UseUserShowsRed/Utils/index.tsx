import { SeasonFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { WritableDraft } from 'immer/dist/internal'
import * as _pick from 'lodash.pick'
import * as _isEqual from 'lodash.isequal'
import { EpisodesStoreState, SingleEpisodeStoreState } from '../@Types'
import { releasedEpisodesToOneArray } from './episodesOneArrayModifiers'

export const updateIsEpisodesWatched = <T,>(showEpisodes: any) => {
  let allReleasedEpisodesWatched: boolean | null = true
  let modifiedData: T[] = []

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
  }, [] as T[])
  return [modifiedData, allReleasedEpisodesWatched] as const
}

export const compareEpisodesAndWriteDraft = (
  episodesStore: WritableDraft<EpisodesStoreState>[],
  episodesPayload: SeasonFromUserDatabase[],
) => {
  episodesPayload.forEach((seasonPayload, seasonIndex) => {
    const seasonPayloadKeys = Object.keys(seasonPayload)

    seasonPayloadKeys.forEach((key) => {
      const seasonStore = episodesStore[seasonIndex]
      if (!seasonStore) return

      if (key === 'episodes') {
        seasonPayload.episodes.forEach((episodePayload, episodeIndex) => {
          const episodeStore = episodesStore[seasonIndex].episodes[episodeIndex]
          if (!episodeStore) return

          const keysToCompare = Object.keys(episodePayload)
          const isEpisodePayloadEqual = _isEqual(episodePayload, _pick(episodeStore, keysToCompare))

          if (!isEpisodePayloadEqual) {
            episodesStore[seasonIndex].episodes[episodeIndex] = Object.assign(episodeStore, episodePayload)
          }
        })
      } else {
        if (seasonPayload[key] !== seasonStore[key]) {
          episodesStore[seasonIndex][key] = seasonPayload[key]
        }
      }
    })
  })
}

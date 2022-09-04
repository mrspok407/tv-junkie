/* eslint-disable max-len */
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { combineMergeObjects, handleNotArrayData } from 'Utils'
import merge from 'deepmerge'
import { EpisodesStoreState, SingleEpisodeStoreState } from '../../@Types'

interface FetchEpisodesFullData {
  authUserUid: string
  showKey: string | number
  firebase: FirebaseInterface
}
export const fetchEpisodesFullData = async ({ authUserUid, showKey, firebase }: FetchEpisodesFullData) => {
  const [episodesFireDatabase, episodesUserDatabase] = await Promise.all([
    firebase.showEpisodesFireDatabase(showKey).once('value'),
    firebase.showEpisodesUserDatabase(authUserUid, showKey).once('value'),
  ])
  const episodesUserFireMerge: EpisodesStoreState[] = merge(
    episodesFireDatabase.val() || [],
    episodesUserDatabase.val() || [],
    {
      arrayMerge: combineMergeObjects,
    },
  )

  const episodesUserFireMergeWithIndexes = addOriginalIndexesToEpisodesFullData(episodesUserFireMerge, showKey)
  return episodesUserFireMergeWithIndexes
}

export const addOriginalIndexesToEpisodesFullData = (
  episodesFullInfo: EpisodesStoreState[],
  showId: number | string,
) => {
  return episodesFullInfo.map((season, seasonIndex) => {
    if (!Array.isArray(season.episodes)) {
      handleNotArrayData({
        type: 'show',
        id: showId,
        seasonData: season,
      })
    }

    const seasonEpisodes = Array.isArray(season.episodes)
      ? season.episodes
      : Object.values<SingleEpisodeStoreState>(season.episodes)

    const episodesWithIndexes = seasonEpisodes.map((episode, episodeIndex) => ({
      ...episode,
      originalEpisodeIndex: episodeIndex,
      originalSeasonIndex: seasonIndex,
    }))
    return { ...season, episodes: episodesWithIndexes, originalSeasonIndex: seasonIndex }
  })
}

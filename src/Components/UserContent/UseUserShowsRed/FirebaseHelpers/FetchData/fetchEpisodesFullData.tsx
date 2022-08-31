import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { combineMergeObjects } from 'Utils'
import merge from 'deepmerge'
import { EpisodesStoreState } from '../../@Types'

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

  const episodesUserFireMergeWithIndexes = addOriginalIndexesToEpisodesFullData(episodesUserFireMerge)
  return episodesUserFireMergeWithIndexes
}

export const addOriginalIndexesToEpisodesFullData = (episodesFullInfo: EpisodesStoreState[]) => {
  return episodesFullInfo.map((season, seasonIndex) => {
    const episodesWithIndexes = season.episodes.map((episode, episodeIndex) => ({
      ...episode,
      originalEpisodeIndex: episodeIndex,
      originalSeasonIndex: seasonIndex,
    }))
    return { ...season, episodes: episodesWithIndexes, originalSeasonIndex: seasonIndex }
  })
}

import { SnapshotVal } from 'Components/AppContext/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { combineMergeObjects } from 'Utils'
import merge from 'deepmerge'
import { EpisodesFromFireDatabase } from 'Components/Firebase/@Types'

interface FetchEpisodesFullData {
  uid: string
  showKey: string | number
  firebase: FirebaseInterface
}
export const fetchEpisodesFullData = async ({ uid, showKey, firebase }: FetchEpisodesFullData) => {
  const [episodesData, userEpisodes]: SnapshotVal<EpisodesFromFireDatabase[]>[] = await Promise.all([
    firebase.showEpisodes(showKey).once('value'),
    firebase.userShowAllEpisodes(uid, showKey).once('value'),
  ])
  const episodesFullData: EpisodesFromFireDatabase[] = merge(episodesData.val(), userEpisodes.val(), {
    arrayMerge: combineMergeObjects,
  })
  return episodesFullData
}

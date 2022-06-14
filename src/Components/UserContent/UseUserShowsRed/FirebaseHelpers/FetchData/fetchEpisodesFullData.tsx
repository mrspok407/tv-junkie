import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { combineMergeObjects } from 'Utils'
import merge from 'deepmerge'
import { EpisodesStoreState } from '../../@Types'

interface FetchEpisodesFullData {
  uid: string
  showKey: string | number
  firebase: FirebaseInterface
}
export const fetchEpisodesFullData = async ({ uid, showKey, firebase }: FetchEpisodesFullData) => {
  const [episodesFireDatabase, episodesUserDatabase] = await Promise.all([
    firebase.showEpisodesFireDatabase(showKey).once('value'),
    firebase.showEpisodesUserDatabase(uid, showKey).once('value'),
  ])
  const episodesFullData: EpisodesStoreState[] = merge(
    episodesFireDatabase.val() || [],
    episodesUserDatabase.val() || [],
    {
      arrayMerge: combineMergeObjects,
    },
  )
  return episodesFullData
}

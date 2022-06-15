import { ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { EpisodesFromUserDatabase } from '../@TypesFirebase'
import { FirebaseInterface } from '../FirebaseContext'

export interface PostUserShowScheme {
  authUid: string
  showDetailesTMDB: MainDataTMDB
  showEpisodes: EpisodesFromUserDatabase['episodes']
  showDatabase: string
  firebase: FirebaseInterface
}

export interface UpdateUserShowStatusScheme {
  authUid: string
  id: number
  userShowStatus: string
  showFromStore: ShowFullDataStoreState
  firebase: FirebaseInterface
}

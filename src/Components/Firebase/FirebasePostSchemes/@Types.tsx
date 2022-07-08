import { AuthUserFirebaseInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { ShowFullDataStoreState, UserShowStatuses } from 'Components/UserContent/UseUserShowsRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { EpisodesFromUserDatabase } from '../@TypesFirebase'
import { FirebaseInterface } from '../FirebaseContext'

export interface PostUserShowScheme {
  authUid: string
  showDetailesTMDB: MainDataTMDB
  showEpisodes: EpisodesFromUserDatabase['episodes']
  showDatabase: UserShowStatuses
  firebase: FirebaseInterface
}

export interface UpdateUserShowStatusScheme {
  authUid: string
  id: number
  userShowStatus: string
  showFromStore: ShowFullDataStoreState
  firebase: FirebaseInterface
}

export interface PostUserDataOnRegister {
  authUserFirebase: AuthUserFirebaseInterface
  userName: string
  firebase: FirebaseInterface
}

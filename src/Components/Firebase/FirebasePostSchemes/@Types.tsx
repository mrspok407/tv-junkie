import { AuthUserFirebaseInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { ShowFullDataStoreState, UserShowStatuses } from 'Components/UserContent/UseUserShowsRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { EpisodesFromUserDatabase, SeasonFromUserDatabase, ShowInfoFromUserDatabase } from '../@TypesFirebase'
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
  showFromStore?: ShowFullDataStoreState
  showUserDatabase?: ShowInfoFromUserDatabase | null
  firebase: FirebaseInterface
}

export interface DataOnRegisterEpisodes {
  [key: string]: SeasonFromUserDatabase[]
}
export interface DataOnRegisterEpisodesInfo {
  [key: string]: EpisodesFromUserDatabase['info']
}
export interface DataOnRegisterEpisodesFullData {
  [key: string]: EpisodesFromUserDatabase
}
export interface DataOnRegisterShowInfo {
  [key: string]: ShowInfoFromUserDatabase
}
export interface PostUserDataOnRegister {
  authUserFirebase: AuthUserFirebaseInterface
  userName: string
  firebase: FirebaseInterface
  selectedShows: MainDataTMDB[]
  episodes: DataOnRegisterEpisodes
  episodesInfo: DataOnRegisterEpisodesInfo
}

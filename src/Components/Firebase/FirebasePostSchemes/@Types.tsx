import { AuthUserFirebaseInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import {
  ShowFullDataStoreState,
  SingleEpisodeStoreState,
  UserShowStatuses,
} from 'Components/UserContent/UseUserShowsRed/@Types'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import {
  EpisodesFromUserDatabase,
  MovieInfoFromUserDatabase,
  SeasonFromUserDatabase,
  ShowInfoFromUserDatabase,
  SingleEpisodeFromFireDatabase,
  SingleEpisodeFromUserDatabase,
} from '../@TypesFirebase'
import { FirebaseInterface } from '../FirebaseContext'

export interface PostUserShowScheme {
  authUid: string
  showDetailsTMDB: MainDataTMDB
  showEpisodes: EpisodesFromUserDatabase['episodes']
  showDatabase: UserShowStatuses
  firebase: FirebaseInterface
}

export interface PostUserMovieScheme {
  authUid: string
  movieDetailsTMDB: MainDataTMDB
  firebase: FirebaseInterface
}

export interface UpdateUserShowStatusScheme {
  authUid: string
  id: number
  userShowStatus: string
  showFromStore: ShowFullDataStoreState
  firebase: FirebaseInterface
}

export interface PostCheckAllReleasedEpisodesScheme {
  authUid: string
  showId: number
  releasedEpisodes: SingleEpisodeFromFireDatabase[]
  isWatched: boolean
}
export interface DataCheckAllReleasedEpisodes {
  [key: string]: SingleEpisodeFromUserDatabase['watched']
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
export interface DataOnRegisterMovieInfo {
  [key: string]: MovieInfoFromUserDatabase
}
export interface PostUserDataOnRegister {
  authUserFirebase: AuthUserFirebaseInterface
  userName: string
  firebase: FirebaseInterface
  selectedShows: MainDataTMDB[]
  episodes: DataOnRegisterEpisodes
  episodesInfo: DataOnRegisterEpisodesInfo
  watchLaterMovies: MainDataTMDB[]
}

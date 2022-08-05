/* eslint-disable max-len */
import { createContext } from 'react'
import { MAINDATA_TMDB_INITIAL } from 'Utils/@TypesTMDB'
import {
  EpisodesFromUserDatabase,
  SHOW_FULL_DATA_FIRE_DATABASE_INITIAL,
  setSnapshotValInitial,
  ShowFullDataFireDatabase,
  ShowInfoFromUserDatabase,
  SnapshotVal,
  MovieInfoFromUserDatabase,
  SingleEpisodeFromUserDatabase,
  SeasonFromUserDatabase,
} from './@TypesFirebase'

export interface FirebaseFetchMethods<T> {
  once: (value: string, callback?: any, errorCallback?: (err: unknown) => any) => Promise<SnapshotVal<T>>
  on: (value: string, callback: (snapshot: any) => void, errorCallback?: (err: unknown) => any) => void
  off: (value?: string, callbackcallback?: (snapshot: any) => void) => void
}

export interface FirebaseReferenceProps<T> {
  child: (value: string) => FirebaseReferenceProps<T>
  orderByChild: (value: string) => FirebaseReferenceProps<T>
  once: FirebaseFetchMethods<T>['once']
  on: FirebaseFetchMethods<T>['on']
  off: FirebaseFetchMethods<T>['off']
  update: (value: Partial<T>) => Promise<void>
  set: (value: Partial<T>) => Promise<void>
  transaction: (
    callback: (snapshot: T) => any,
    onComplete?: any,
  ) => Promise<{ commited: boolean; snapshot: SnapshotVal<T> }>
  startAfter: (value: string | number) => FirebaseFetchMethods<T>
}

export interface FirebaseInterface {
  [key: string]: any
  auth?: any
  app?: any
  user?: any
  showEpisodesFireDatabase: (showKey: string | number) => FirebaseReferenceProps<ShowFullDataFireDatabase['episodes']>
  showEpisodesUserDatabase: (
    uid: string,
    showKey: string | number,
  ) => FirebaseReferenceProps<EpisodesFromUserDatabase['episodes']>
  showFullDataFireDatabase: (showKey: string | number) => FirebaseReferenceProps<ShowFullDataFireDatabase>
  showInfoFireDatabase: (showKey: string | number) => FirebaseReferenceProps<ShowFullDataFireDatabase['info']>
  showsInfoUserDatabase: (authUid: string) => FirebaseReferenceProps<ShowInfoFromUserDatabase[]>
  showsEpisodesUserDatabase: (authUid: string) => FirebaseReferenceProps<EpisodesFromUserDatabase[]>
  userShow: ({
    authUid,
    key,
  }: {
    authUid: string
    key: string | number
  }) => FirebaseReferenceProps<ShowInfoFromUserDatabase | null>
  userShowSingleSeason: ({
    authUid,
    key,
    seasonNumber,
  }: {
    authUid: string
    key: string | number
    seasonNumber: number
  }) => FirebaseReferenceProps<SeasonFromUserDatabase | null>
  userShowSingleEpisode: ({
    authUid,
    key,
    seasonNumber,
    episodeNumber,
  }: {
    authUid: string
    key: string | number
    seasonNumber: number
    episodeNumber: number
  }) => FirebaseReferenceProps<SingleEpisodeFromUserDatabase | null>
  userMovie: ({
    authUid,
    key,
  }: {
    authUid: string
    key: string | number
  }) => FirebaseReferenceProps<MovieInfoFromUserDatabase | null>
  userMovieFinished: ({
    authUid,
    key,
  }: {
    authUid: string
    key: string | number
  }) => FirebaseReferenceProps<boolean | null>
  userShowId: ({ authUid, key }: { authUid: string; key: string | number }) => FirebaseReferenceProps<number | null>
  userShowAllEpisodesWatched: ({
    authUid,
    key,
  }: {
    authUid: string
    key: string | number
  }) => FirebaseReferenceProps<boolean | null>
  moviesInfoUserDatabase: (authUid: string) => FirebaseReferenceProps<MovieInfoFromUserDatabase[]>
  ServerValueIncrement: (value: number) => any
  timeStamp?: any
  callback?: any
  userShowAllEpisodesInfo?: any
  watchLaterMovies?: any
  onAuthUserListener?: any
  signInWithEmailAndPassword?: any
  signOut?: any
  createUserWithEmailAndPassword?: any
  sendEmailVerification?: any
  passwordReset?: any
  httpsCallable?: any
  userContent: (uid: string) => any
  messages: ({ chatKey, isGroupChat }: { chatKey: string; isGroupChat: boolean }) => any
  message: ({ chatKey, messageKey, isGroupChat }: { chatKey: string; messageKey: string; isGroupChat: boolean }) => any
  privateChat: () => any
  unreadMessages: ({ uid, chatKey }: { uid: string | undefined; chatKey: string; isGroupChat: boolean }) => any
  newContactsRequests: ({ uid }: { uid: string | undefined }) => any
  newContactsActivity: ({ uid }: { uid: string | undefined }) => any
  contactsLastActivity: ({ uid }: { uid: string | undefined }) => any
  contactsDatabase: ({ uid }: { uid: string | undefined }) => any
  contactsList: ({ uid }: { uid: string | undefined }) => any
  contact: ({ authUid, contactUid }: { authUid: string | undefined; contactUid: string }) => any
  chatMemberStatus: ({
    chatKey,
    memberKey,
    isGroupChat,
  }: {
    chatKey: string
    memberKey: string
    isGroupChat: boolean
  }) => any
  groupChatMembersStatus: ({ chatKey }: { chatKey: string }) => any
  groupChatParticipants: ({ chatKey }: { chatKey: string }) => any
  rootRef: () => any
}

const firebaseOnceInitial = <T,>(initialState: T) =>
  Promise.resolve({
    val: () => {
      return initialState
    },
    key: '',
  })

const firebaseRefInitial = <T,>(initialState: T) => {
  return {
    once: () => firebaseOnceInitial(initialState),
    on: () => {},
    off: () => {},
    child: () => firebaseRefInitial(initialState),
    orderByChild: () => firebaseRefInitial(initialState),
    update: () => Promise.resolve(),
    set: () => Promise.resolve(),
    transaction: () => Promise.resolve({ commited: false, snapshot: setSnapshotValInitial(initialState) }),
    startAfter: () => firebaseRefInitial(initialState),
  }
}

export const FIREBASE_INITIAL_STATE = {
  userContent: () => {},
  newContactsActivity: () => {},
  contactsLastActivity: () => {},
  newContactsRequests: () => {},
  contactsDatabase: () => {},
  contactsList: () => {},
  contact: () => {},
  messages: () => {},
  message: () => {},
  privateChat: () => {},
  unreadMessages: () => {},
  chatMemberStatus: () => {},
  groupChatMembersStatus: () => {},
  groupChatParticipants: () => {},
  rootRef: () => {},
  ServerValueIncrement: () => {},
  showEpisodesFireDatabase: () => firebaseRefInitial(SHOW_FULL_DATA_FIRE_DATABASE_INITIAL.episodes),
  showFullDataFireDatabase: () => firebaseRefInitial(SHOW_FULL_DATA_FIRE_DATABASE_INITIAL),
  showInfoFireDatabase: () => firebaseRefInitial(SHOW_FULL_DATA_FIRE_DATABASE_INITIAL.info),
  showsInfoUserDatabase: () => firebaseRefInitial([]),
  moviesInfoUserDatabase: () => firebaseRefInitial([]),
  showEpisodesUserDatabase: () => firebaseRefInitial([]),
  showsEpisodesUserDatabase: () => firebaseRefInitial([]),
  userShow: () => firebaseRefInitial(null),
  userShowSingleSeason: () => firebaseRefInitial(null),
  userShowSingleEpisode: () => firebaseRefInitial(null),
  userMovie: () => firebaseRefInitial(null),
  userMovieFinished: () => firebaseRefInitial(null),
  userShowId: () => firebaseRefInitial(null),
  userShowAllEpisodesWatched: () => firebaseRefInitial(null),
}

export const FirebaseContext = createContext<FirebaseInterface>(FIREBASE_INITIAL_STATE)

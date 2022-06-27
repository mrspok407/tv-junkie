/* eslint-disable max-len */
import { createContext } from 'react'
import {
  EpisodesFromUserDatabase,
  SHOW_FULL_DATA_FIRE_DATABASE_INITIAL,
  setSnapshotValInitial,
  ShowFullDataFireDatabase,
  ShowInfoFromUserDatabase,
  SnapshotVal,
} from './@TypesFirebase'

export interface FirebaseFetchMethods<T> {
  once: (value: string, callback?: any, errorCallback?: (err: unknown) => any) => Promise<SnapshotVal<T>>
  on: (value: string, callback: (snapshot: any) => void, errorCallback?: (err: unknown) => any) => void
}

export interface FirebaseReferenceProps<T> {
  child: (value: string) => FirebaseReferenceProps<T>
  orderByChild: (value: string) => FirebaseReferenceProps<T>
  once: FirebaseFetchMethods<T>['once']
  on: FirebaseFetchMethods<T>['on']
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
  timeStamp?: any
  callback?: any
  userShow?: any
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
  showEpisodesFireDatabase: () => firebaseRefInitial(SHOW_FULL_DATA_FIRE_DATABASE_INITIAL.episodes),
  showFullDataFireDatabase: () => firebaseRefInitial(SHOW_FULL_DATA_FIRE_DATABASE_INITIAL),
  showInfoFireDatabase: () => firebaseRefInitial(SHOW_FULL_DATA_FIRE_DATABASE_INITIAL.info),
  showsInfoUserDatabase: () => firebaseRefInitial([]),
  showEpisodesUserDatabase: () => firebaseRefInitial([]),
  showsEpisodesUserDatabase: () => firebaseRefInitial([]),
}

export const FirebaseContext = createContext<FirebaseInterface>(FIREBASE_INITIAL_STATE)

/* eslint-disable max-len */
import { createContext } from 'react'
import {
  EpisodesFromUserDatabase,
  EPISODES_FROM_FIRE_DATABASE_INITIAL,
  setSnapshotValInitial,
  ShowFullDataFireDatabase,
  ShowInfoFromUserDatabase,
  SnapshotVal,
} from './@TypesFirebase'

export interface FirebaseOnce<T> {
  once: (value: string, callback?: any) => Promise<SnapshotVal<T>>
}

export interface FirebaseReferenceProps<T> {
  child: (value: string) => FirebaseReferenceProps<T>
  orderByChild: (value: string) => FirebaseReferenceProps<T>
  once: FirebaseOnce<T>['once']
  update: (value: Partial<T>) => Promise<void>
  set: (value: Partial<T>) => Promise<void>
  transaction: (
    callback: (snapshot: T) => any,
    onComplete?: any,
  ) => Promise<{ commited: boolean; snapshot: SnapshotVal<T> }>
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
  timeStamp?: any
  callback?: any
  userEpisodes?: any
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
    child: () => firebaseRefInitial(initialState),
    orderByChild: () => firebaseRefInitial(initialState),
    update: () => Promise.resolve(),
    set: () => Promise.resolve(),
    transaction: () => Promise.resolve({ commited: false, snapshot: setSnapshotValInitial(initialState) }),
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
  showEpisodesFireDatabase: () => firebaseRefInitial(EPISODES_FROM_FIRE_DATABASE_INITIAL.episodes),
  showFullDataFireDatabase: () => firebaseRefInitial(EPISODES_FROM_FIRE_DATABASE_INITIAL),
  showInfoFireDatabase: () => firebaseRefInitial(EPISODES_FROM_FIRE_DATABASE_INITIAL.info),
  showsInfoUserDatabase: () => firebaseRefInitial([]),
  showEpisodesUserDatabase: () => firebaseRefInitial(EPISODES_FROM_FIRE_DATABASE_INITIAL.episodes),
}

export const FirebaseContext = createContext<FirebaseInterface>(FIREBASE_INITIAL_STATE)

import { SnapshotVal } from 'Components/AppContext/@Types'
import { createContext } from 'react'
import { EpisodesFromFireDatabase, EPISODES_FROM_FIRE_DATABASE_INITIAL, ShowFullDataFireDatabase } from './@Types'

export interface FirebaseOnce<T> {
  once: (value: string) => Promise<SnapshotVal<T>>
}

export interface FirebaseReferenceProps<T> {
  child: (value: string) => FirebaseOnce<T>
  once: FirebaseOnce<T>['once']
}

export interface FirebaseInterface {
  [key: string]: any
  auth?: any
  app?: any
  user?: any
  showEpisodes: (showKey: string | number) => any
  showFullDataFireDatabase: (showKey: string | number) => FirebaseReferenceProps<ShowFullDataFireDatabase>
  timeStamp?: any
  callback?: any
  userAllShows?: any
  userEpisodes?: any
  userShow?: any
  userShowAllEpisodes: (uid: string, showKey: string | number) => any
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
    child: () => ({ once: () => firebaseOnceInitial(initialState) }),
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
  userShowAllEpisodes: () => {},
  showEpisodes: () => {},
  showFullDataFireDatabase: () => firebaseRefInitial(EPISODES_FROM_FIRE_DATABASE_INITIAL),
}

export const FirebaseContext = createContext<FirebaseInterface>(FIREBASE_INITIAL_STATE)

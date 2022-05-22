import { createContext } from 'react'

export interface FirebaseInterface {
  [key: string]: any
  auth?: any
  app?: any
  user?: any
  showEpisodes: (showKey: string | number) => any
  showFullData?: any
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
}

export const FirebaseContext = createContext<FirebaseInterface>(FIREBASE_INITIAL_STATE)

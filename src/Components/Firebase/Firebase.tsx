import app from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/database'
import 'firebase/compat/analytics'
import 'firebase/compat/functions'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'

const configProduction = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  appId: process.env.REACT_APP_APP_ID,
}

const configDevelopment = {
  apiKey: process.env.REACT_APP_DEV_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DEV_DATABASE_URL,
  projectId: process.env.REACT_APP_DEV_PROJECT_ID,
  storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID,
  measurementId: process.env.REACT_APP_DEV_MEASUREMENT_ID,
  appId: process.env.REACT_APP_DEV_APP_ID,
}

const config: any = process.env.NODE_ENV === 'production' ? configProduction : configDevelopment

if (window.location.hostname === 'localhost') {
  config.databaseURL = 'http://localhost:9000/?ns=pet-project-development-default-rtdb'
}

interface ReferenceInterface {
  authUid: string
  key: string
  seasonNumber: number
  episodeNumber: number
}

class Firebase {
  auth: any

  db: any

  dbRef: any

  analytics: any

  functions: any

  googleProvider: any

  app: any

  constructor() {
    app.initializeApp(config)

    this.auth = app.auth()
    this.db = app.database()
    this.analytics = app.analytics()
    this.functions = app.functions()

    this.dbRef = app.database

    this.googleProvider = new app.auth.GoogleAuthProvider()

    this.app = app

    if (window.location.hostname === 'localhost') {
      app.functions().useEmulator('localhost', 4000)
      app.auth().useEmulator('http://localhost:9099')
    }
  }

  /// Cloud Functions ///

  httpsCallable = (functionName: string) => this.functions.httpsCallable(functionName)

  /// Auth API ///

  createUserWithEmailAndPassword = (email: string, password: string) =>
    this.auth.createUserWithEmailAndPassword(email, password)

  signInWithEmailAndPassword = (email: string, password: string) =>
    this.auth.signInWithEmailAndPassword(email, password)

  signInWithGooglePopUp = () => this.auth.signInWithPopup(this.googleProvider)

  signInWithGoogleRedirect = () => this.auth.signInWithRedirect(this.googleProvider)

  sendEmailVerification = () => this.auth.currentUser.sendEmailVerification()

  signOut = () => this.auth.signOut()

  passwordReset = (email: string) => this.auth.sendPasswordResetEmail(email)

  passwordUpdate = (password: string) => this.auth.currentUser.updatePassword(password)

  onAuthUserListener = (next: (authUser: AuthUserInterface['authUser']) => void, fallback: () => void) =>
    this.auth.onAuthStateChanged((authUserFirebase: AuthUserInterface['authUser']) => {
      let authUserData = { ...authUserFirebase }
      if (authUserFirebase) {
        authUserData = {
          uid: authUserFirebase?.uid,
          email: authUserFirebase?.email,
          emailVerified: authUserFirebase?.emailVerified,
        }
        next(authUserData)
      } else {
        fallback()
      }
    })

  timeStamp = () => this.dbRef.ServerValue.TIMESTAMP

  ServerValueIncrement = (value: number) => this.dbRef.ServerValue.increment(value)

  database = () => this.db

  rootRef = () => this.db.ref()

  /// Shows In Database ///
  allShowsList = () => this.db.ref('allShowsList')

  allShowsListIds = () => this.db.ref('allShowsListIds')

  usersWatchingShowList = (showKey: string | number) => this.db.ref(`allShowsList/${showKey}/usersWatchingList`)

  showFullDataFireDatabase = (showKey: string | number) => this.db.ref(`allShowsList/${showKey}`)

  showInfoFireDatabase = (showKey: string | number) => this.db.ref(`allShowsList/${showKey}/info`)

  showEpisodesFireDatabase = (showKey: string | number) => this.db.ref(`allShowsList/${showKey}/episodes`)

  /// Users API ///
  user = (uid: string) => this.db.ref(`users/${uid}`)

  users = () => this.db.ref('users')

  userOnlineStatus = (uid: string) => this.db.ref(`users/${uid}/status`)

  /// Contacts API ///

  newContactsRequests = ({ uid }: { uid: string | undefined }) =>
    this.db.ref(`users/${uid}/contactsDatabase/newContactsRequests`)

  newContactsActivity = ({ uid }: { uid: string | undefined }) =>
    this.db.ref(`users/${uid}/contactsDatabase/newContactsActivity`)

  contactsLastActivity = ({ uid }: { uid: string | undefined }) =>
    this.db.ref(`users/${uid}/contactsDatabase/contactsLastActivity`)

  contactsDatabase = ({ uid }: { uid: string | undefined }) => this.db.ref(`users/${uid}/contactsDatabase`)

  contactsList = ({ uid }: { uid: string | undefined }) => this.db.ref(`users/${uid}/contactsDatabase/contactsList`)

  contact = ({ authUid, contactUid }: { authUid: string | undefined; contactUid: string }) =>
    this.db.ref(`users/${authUid}/contactsDatabase/contactsList/${contactUid}`)

  /// Chats API ///
  privateChats = () => this.db.ref('privateChats')

  groupChats = () => this.db.ref('groupChats')

  messages = ({ chatKey, isGroupChat }: { chatKey: string; isGroupChat: boolean }) => {
    if (isGroupChat) {
      return this.db.ref(`groupChats/${chatKey}/messages`)
    }
    return this.db.ref(`privateChats/${chatKey}/messages`)
  }

  message = ({ chatKey, messageKey, isGroupChat }: { chatKey: string; messageKey: string; isGroupChat: boolean }) => {
    if (isGroupChat) {
      return this.db.ref(`groupChats/${chatKey}/messages/${messageKey}`)
    }
    return this.db.ref(`privateChats/${chatKey}/messages/${messageKey}`)
  }

  unreadMessages = ({
    uid,
    chatKey,
    isGroupChat = false,
  }: {
    uid: string | undefined
    chatKey: string
    isGroupChat: boolean
  }) => {
    if (isGroupChat) {
      return this.db.ref(`groupChats/${chatKey}/members/unreadMessages/${uid}`)
    }
    return this.db.ref(`privateChats/${chatKey}/members/${uid}/unreadMessages`)
  }

  chatMemberStatus = ({
    chatKey,
    memberKey,
    isGroupChat,
  }: {
    chatKey: string
    memberKey: string
    isGroupChat: boolean
  }) => {
    if (isGroupChat) {
      return this.db.ref(`groupChats/${chatKey}/members/status/${memberKey}`)
    }
    return this.db.ref(`privateChats/${chatKey}/members/${memberKey}/status`)
  }

  groupChatMembersStatus = ({ chatKey }: { chatKey: string }) => this.db.ref(`groupChats/${chatKey}/members/status`)

  groupChatParticipants = ({ chatKey }: { chatKey: string }) =>
    this.db.ref(`groupChats/${chatKey}/members/participants`)

  /// User Content API ///
  userContent = (uid: string) => this.db.ref(`users/${uid}/content`)

  showsInfoUserDatabase = (uid: string) => this.db.ref(`users/${uid}/content/shows`)

  showsEpisodesUserDatabase = (uid: string) => this.db.ref(`users/${uid}/content/episodes`)

  userShowsLastUpdateList = (uid: string) => this.db.ref(`users/${uid}/content/showsLastUpdateList`)

  userShow = ({ authUid, key }: ReferenceInterface) => this.db.ref(`users/${authUid}/content/shows/${key}`)

  userShowId = ({ authUid, key }: { authUid: string; key: string | number }) =>
    this.db.ref(`users/${authUid}/content/shows/${key}/id`)

  userShowAllEpisodesWatched = ({ authUid, key }: { authUid: string; key: string | number }) =>
    this.db.ref(`users/${authUid}/content/shows/${key}/allEpisodesWatched`)

  userShowEpisodes = (uid: string, showKey: string) => this.db.ref(`users/${uid}/content/episodes/${showKey}`)

  showEpisodesUserDatabase = (uid: string, showKey: string | number) =>
    this.db.ref(`users/${uid}/content/episodes/${showKey}/episodes`)

  userShowAllEpisodesInfo = (uid: string, showKey: string) =>
    this.db.ref(`users/${uid}/content/episodes/${showKey}/info`)

  userShowSingleSeason = ({ authUid, key, seasonNumber }: ReferenceInterface) =>
    this.db.ref(`users/${authUid}/content/episodes/${key}/episodes/${seasonNumber}`)

  userShowSingleEpisode = ({ authUid, key, seasonNumber, episodeNumber }: ReferenceInterface) =>
    this.db.ref(`users/${authUid}/content/episodes/${key}/episodes/${seasonNumber}/episodes/${episodeNumber}`)

  moviesInfoUserDatabase = (uid: string) => this.db.ref(`users/${uid}/content/movies/watchLaterMovies`)

  userMovie = ({ authUid, key }: ReferenceInterface) =>
    this.db.ref(`users/${authUid}/content/movies/watchLaterMovies/${key}`)

  userMovieFinished = ({ authUid, key }: ReferenceInterface) =>
    this.db.ref(`users/${authUid}/content/movies/watchLaterMovies/${key}/finished`)
}

export default Firebase

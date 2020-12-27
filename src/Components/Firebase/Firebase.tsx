import app from "firebase/app"
import { database } from "firebase/app"
import "firebase/auth"
import "firebase/database"
import "firebase/analytics"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

const configProduction = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  appId: process.env.REACT_APP_APP_ID
}

const configDevelopment = {
  apiKey: process.env.REACT_APP_DEV_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_DEV_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DEV_DATABASE_URL,
  projectId: process.env.REACT_APP_DEV_PROJECT_ID,
  storageBucket: process.env.REACT_APP_DEV_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_DEV_MESSAGING_SENDER_ID,
  measurementId: process.env.REACT_APP_DEV_MEASUREMENT_ID,
  appId: process.env.REACT_APP_DEV_APP_ID
}

const config = process.env.NODE_ENV === "production" ? configProduction : configDevelopment

interface ReferenceInterface {
  uid: string
  key: string
  seasonNum: number
  episodeNum: number
}

class Firebase {
  auth: any
  db: any
  analytics: any
  googleProvider: any
  app: any

  constructor() {
    app.initializeApp(config)

    this.auth = app.auth()
    this.db = app.database()
    this.analytics = app.analytics()

    this.googleProvider = new app.auth.GoogleAuthProvider()

    this.app = app
  }

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

  onAuthUserListener = (next: (authUser: AuthUserInterface) => void, fallback: () => void) =>
    this.auth.onAuthStateChanged((authUser: AuthUserInterface) => {
      if (authUser) {
        authUser = {
          uid: authUser.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified
        }
        next(authUser)
      } else {
        fallback()
      }
    })

  timeStamp = () => database.ServerValue.TIMESTAMP

  /// Shows In Database ///
  allShowsList = () => this.db.ref(`allShowsList`)
  showInDatabase = (showKey: string) => this.db.ref(`allShowsList/${showKey}`)
  showInfo = (showKey: string) => this.db.ref(`allShowsList/${showKey}/info`)
  showEpisodes = (showKey: string) => this.db.ref(`allShowsList/${showKey}/episodes`)

  /// Users API ///
  user = (uid: string) => this.db.ref(`users/${uid}`)
  users = () => this.db.ref("users")
  userOnlineStatus = (uid: string) => this.db.ref(`users/${uid}/status`)

  /// User Content API ///
  userAllShows = (uid: string) => this.db.ref(`users/${uid}/content/shows`)
  userShowsLastUpdateList = (uid: string) => this.db.ref(`users/${uid}/content/showsLastUpdateList`)
  userShow = ({ uid, key }: { uid: string; key: string }) => this.db.ref(`users/${uid}/content/shows/${key}`)

  userEpisodes = (uid: string) => this.db.ref(`users/${uid}/content/episodes`)
  userEpisodesNotFinished = (uid: string) => this.db.ref(`users/${uid}/content/episodes/notFinished`)

  userShowEpisodes = (uid: string, showKey: string) => this.db.ref(`users/${uid}/content/episodes/${showKey}`)
  userShowAllEpisodes = (uid: string, showKey: string) =>
    this.db.ref(`users/${uid}/content/episodes/${showKey}/episodes`)
  userShowAllEpisodesInfo = (uid: string, showKey: string) =>
    this.db.ref(`users/${uid}/content/episodes/${showKey}/info`)

  userShowSingleEpisode = ({ uid, key, seasonNum, episodeNum }: ReferenceInterface) =>
    this.db.ref(`users/${uid}/content/episodes/${key}/episodes/${seasonNum - 1}/episodes/${episodeNum}`)
  userShowSingleEpisodeNotFinished = ({ uid, key, seasonNum, episodeNum }: ReferenceInterface) =>
    this.db.ref(`users/${uid}/content/episodes/notFinished/${key}/episodes/${seasonNum - 1}/episodes/${episodeNum}`)

  userShowSeasonEpisodes = ({ uid, key, seasonNum }: ReferenceInterface) =>
    this.db.ref(`users/${uid}/content/episodes/${key}/episodes/${seasonNum - 1}/episodes`)
  userShowSeasonEpisodesNotFinished = ({ uid, key, seasonNum }: ReferenceInterface) =>
    this.db.ref(`users/${uid}/content/episodes/notFinished/${key}/episodes/${seasonNum - 1}/episodes`)

  userShowSeason = ({ uid, key, seasonNum }: ReferenceInterface) =>
    this.db.ref(`users/${uid}/content/episodes/${key}/episodes/${seasonNum - 1}`)

  watchLaterMovies = (uid: string) => this.db.ref(`users/${uid}/content/movies/watchLaterMovies`)
}

export default Firebase

import app from "firebase/app"
import { database } from "firebase/app"
import "firebase/auth"
import "firebase/database"
import "firebase/analytics"

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  appId: process.env.REACT_APP_APP_ID
}

class Firebase {
  constructor() {
    app.initializeApp(config)

    this.auth = app.auth()
    this.db = app.database()
    this.analytics = app.analytics()

    this.googleProvider = new app.auth.GoogleAuthProvider()

    this.app = app
  }

  /// Auth API ///

  createUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password)

  signInWithEmailAndPassword = (email, password) => this.auth.signInWithEmailAndPassword(email, password)

  signInWithGooglePopUp = () => this.auth.signInWithPopup(this.googleProvider)
  signInWithGoogleRedirect = () => this.auth.signInWithRedirect(this.googleProvider)

  sendEmailVerification = () => this.auth.currentUser.sendEmailVerification()

  signOut = () => this.auth.signOut()

  passwordReset = email => this.auth.sendPasswordResetEmail(email)

  passwordUpdate = password => this.auth.currentUser.updatePassword(password)

  onAuthUserListener = (next, fallback) => {
    this.auth.onAuthStateChanged(authUser => {
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
  }

  timeStamp = () => database.ServerValue.TIMESTAMP

  /// Shows In Database ///
  allShowsList = subDatabase => this.db.ref(`allShowsList/${subDatabase}`)
  showInDatabase = (subDatabase, showKey) => this.db.ref(`allShowsList/${subDatabase}/${showKey}`)
  showInfo = (subDatabase, showKey) => this.db.ref(`allShowsList/${subDatabase}/${showKey}/info`)
  showEpisodes = (subDatabase, showKey) => this.db.ref(`allShowsList/${subDatabase}/${showKey}/episodes`)

  /// Users API ///
  user = uid => this.db.ref(`users/${uid}`)
  users = () => this.db.ref("users")

  /// User Content API ///
  userShows = (uid, subDatabase) => this.db.ref(`users/${uid}/content/shows/${subDatabase}`)
  userAllShows = uid => this.db.ref(`users/${uid}/content/shows`)

  userEpisodes = uid => this.db.ref(`users/${uid}/content/episodes`)
  userShowEpisodes = (uid, key) => this.db.ref(`users/${uid}/content/episodes/${key}`)

  userShowOld = ({ uid, key, database }) => this.db.ref(`users/${uid}/content/shows/${database}/${key}`)
  userShow = ({ uid, key }) => this.db.ref(`users/${uid}/content/shows/${key}`)

  // userShowAllEpisodesOld = (uid, showKey) => this.db.ref(`users/${uid}/content/shows/episodes/${showKey}`)

  userShowAllEpisodes = (uid, showKey) => this.db.ref(`users/${uid}/content/episodes/${showKey}/episodes`)
  userShowAllEpisodesInfo = (uid, showKey) => this.db.ref(`users/${uid}/content/episodes/${showKey}/info`)

  userShowSingleEpisode = ({ uid, key, seasonNum, episodeNum }) =>
    this.db.ref(`users/${uid}/content/episodes/${key}/episodes/${seasonNum - 1}/episodes/${episodeNum}`)

  userShowSeasonEpisodes = ({ uid, key, seasonNum }) =>
    this.db.ref(`users/${uid}/content/episodes/${key}/episodes/${seasonNum - 1}/episodes`)

  userShowSeason = ({ uid, key, seasonNum }) =>
    this.db.ref(`users/${uid}/content/episodes/${key}/episodes/${seasonNum - 1}`)

  watchLaterMovies = uid => this.db.ref(`users/${uid}/content/movies/watchLaterMovies`)
}

export default Firebase

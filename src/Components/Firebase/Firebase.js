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

  passwordReset = (email) => this.auth.sendPasswordResetEmail(email)

  passwordUpdate = (password) => this.auth.currentUser.updatePassword(password)

  onAuthUserListener = (next, fallback) => {
    this.auth.onAuthStateChanged((authUser) => {
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
  allShowsList = () => this.db.ref(`allShowsList`)
  showInDatabase = (showKey) => this.db.ref(`allShowsList/${showKey}`)
  showInfo = (showKey) => this.db.ref(`allShowsList/${showKey}/info`)
  showEpisodes = (showKey) => this.db.ref(`allShowsList/${showKey}/episodes`)

  /// Users API ///
  user = (uid) => this.db.ref(`users/${uid}`)
  users = () => this.db.ref("users")

  /// User Content API ///
  userAllShows = (uid) => this.db.ref(`users/${uid}/content/shows`)
  userShow = ({ uid, key }) => this.db.ref(`users/${uid}/content/shows/${key}`)

  userEpisodes = (uid) => this.db.ref(`users/${uid}/content/episodes/all`)
  userEpisodesNotFinished = (uid) => this.db.ref(`users/${uid}/content/episodes/notFinished`)

  userShowEpisodes = (uid, showKey) => this.db.ref(`users/${uid}/content/episodes/all/${showKey}`)
  userShowAllEpisodes = (uid, showKey) => this.db.ref(`users/${uid}/content/episodes/all/${showKey}/episodes`)
  userShowAllEpisodesNotFinished = (uid, key) =>
    this.db.ref(`users/${uid}/content/episodes/notFinished/${key}/episodes`)
  userShowAllEpisodesInfo = (uid, showKey) => this.db.ref(`users/${uid}/content/episodes/all/${showKey}/info`)

  userShowSingleEpisode = ({ uid, key, seasonNum, episodeNum }) =>
    this.db.ref(`users/${uid}/content/episodes/all/${key}/episodes/${seasonNum - 1}/episodes/${episodeNum}`)
  userShowSingleEpisodeNotFinished = ({ uid, key, seasonNum, episodeNum }) =>
    this.db.ref(
      `users/${uid}/content/episodes/notFinished/${key}/episodes/${seasonNum - 1}/episodes/${episodeNum}`
    )

  userShowSeasonEpisodes = ({ uid, key, seasonNum }) =>
    this.db.ref(`users/${uid}/content/episodes/all/${key}/episodes/${seasonNum - 1}/episodes`)
  userShowSeasonEpisodesNotFinished = ({ uid, key, seasonNum }) =>
    this.db.ref(`users/${uid}/content/episodes/notFinished/${key}/episodes/${seasonNum - 1}/episodes`)

  userShowSeason = ({ uid, key, seasonNum }) =>
    this.db.ref(`users/${uid}/content/episodes/all/${key}/episodes/${seasonNum - 1}`)

  watchLaterMovies = (uid) => this.db.ref(`users/${uid}/content/movies/watchLaterMovies`)
}

export default Firebase

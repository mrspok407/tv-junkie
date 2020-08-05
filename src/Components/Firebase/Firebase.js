import app from "firebase/app"
import { database } from "firebase/app"
import "firebase/auth"
import "firebase/database"

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
}

class Firebase {
  constructor() {
    app.initializeApp(config)

    this.auth = app.auth()
    this.db = app.database()
  }

  /// Auth API ///

  createUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password)

  signInWithEmailAndPassword = (email, password) => this.auth.signInWithEmailAndPassword(email, password)

  sendEmailVerification = () => this.auth.currentUser.sendEmailVerification()

  signOut = () => this.auth.signOut()

  passwordReset = email => this.auth.sendPasswordResetEmail(email)

  passwordUpdate = password => this.auth.currentUser.updatePassword(password)

  onAuthUserListener = (next, fallback) => {
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.user(authUser.uid)
          .once("value")
          .then(snapshot => {
            const dbUser = snapshot.val()

            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              roles: dbUser.roles || {},
              emailVerified: authUser.emailVerified
            }
            next(authUser)
          })
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
  userShow = (uid, showKey, subDatabase) =>
    this.db.ref(`users/${uid}/content/shows/${subDatabase}/${showKey}`)
  userShowAllEpisodes = (uid, showKey, subDatabase) =>
    this.db.ref(`users/${uid}/content/shows/${subDatabase}/${showKey}/episodes`)

  userShowSingleEpisode = (uid, showKey, subDatabase, seasonNum, episodeNum) =>
    this.db.ref(
      `users/${uid}/content/shows/${subDatabase}/${showKey}/episodes/${seasonNum - 1}/episodes/${episodeNum}`
    )

  userShowSeason = (uid, showKey, subDatabase, seasonNum) =>
    this.db.ref(`users/${uid}/content/shows/${subDatabase}/${showKey}/episodes/${seasonNum - 1}/episodes`)

  watchLaterMovies = uid => this.db.ref(`users/${uid}/content/movies/watchLaterMovies`)
}

export default Firebase

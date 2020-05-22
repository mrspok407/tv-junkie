import app from "firebase/app"
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

  createUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password)

  signInWithEmailAndPassword = (email, password) => this.auth.signInWithEmailAndPassword(email, password)

  sendEmailVerification = () => this.auth.currentUser.sendEmailVerification()

  signOut = () => this.auth.signOut()

  passwordReset = email => this.auth.sendPasswordResetEmail(email)

  passwordUpdate = password => this.auth.currentUser.updatePassword(password)

  user = uid => this.db.ref(`users/${uid}`)

  // userWatchingTvShows = uid => this.db.ref(`users/${uid}/watchingtvshows`)
  userContent = uid => this.db.ref(`users/${uid}/content`)

  userWatchingTvShows = uid => this.db.ref(`users/${uid}/content/watchingtvshows`)

  userDroppedTvShows = uid => this.db.ref(`users/${uid}/content/droppedtvshows`)

  users = () => this.db.ref("users")

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
}

export default Firebase

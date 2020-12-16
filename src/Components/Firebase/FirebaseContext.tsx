import React, { createContext } from "react"

export interface FirebaseInterface {
  [key: string]: any
  auth?: any
  app?: any
  user?: any
  showEpisodes?: any
  showInDatabase?: any
  timeStamp?: any
  callback?: any
  userAllShows?: any
  userEpisodes?: any
  userShow?: any
  userShowAllEpisodes?: any
  userShowAllEpisodesInfo?: any
  watchLaterMovies?: any
  onAuthUserListener?: any
  signInWithEmailAndPassword?: any
  signOut?: any
  createUserWithEmailAndPassword?: any
  sendEmailVerification?: any
  passwordReset?: any
}

export const FirebaseContext = createContext<FirebaseInterface>({})

export const withFirebase = (Component: any) => (props: any) => {
  return (
    <FirebaseContext.Consumer>{(firebase) => <Component {...props} firebase={firebase} />}</FirebaseContext.Consumer>
  )
}

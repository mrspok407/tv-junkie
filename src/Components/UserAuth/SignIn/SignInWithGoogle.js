import React, { useState, useEffect, useContext } from "react"
import { compose } from "recompose"
import { withRouter } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"
import * as ROLES from "Utils/Constants/roles"
import * as ROUTES from "Utils/Constants/routes"

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

const mobileLayout = 1000

const SignInWithGoogleBase = ({
  firebase,
  history,
  addShowToDatabase,
  toggleWatchLaterMovie,
  closeNavMobile
}) => {
  //   const [error, setError] = useState()
  const [windowSize, setWindowSize] = useState(window.innerWidth)

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [])

  const context = useContext(UserContentLocalStorageContext)

  const onSubmit = () => {
    const signInType = windowSize < mobileLayout ? "signInWithGoogleRedirect" : "signInWithGooglePopUp"

    firebase[signInType]()
      .then(authUser => {
        const userRole = authUser.user.email === "mr.spok407@gmail.com" ? ROLES.ADMIN : ROLES.USER

        firebase
          .user(authUser.user.uid)
          .update({
            username: authUser.user.displayName,
            email: authUser.user.email,
            role: userRole
          })
          .then(() => {
            const watchingShows = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || []
            const watchLaterMovies =
              JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || []

            watchingShows.forEach(item => {
              addShowToDatabase({
                id: item.id,
                show: item,
                userDatabase: "watchingShows",
                userUid: authUser.user.uid
              })
            })

            watchLaterMovies.forEach(item => {
              toggleWatchLaterMovie({
                id: item.id,
                data: item,
                userDatabase: "watchLaterMovies",
                userUid: authUser.user.uid
              })
            })
          })
          .then(() => {
            localStorage.removeItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)
            localStorage.removeItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)

            context.clearContentState()

            if (closeNavMobile) closeNavMobile()
          })
      })
      .then(() => {
        history.push(ROUTES.HOME_PAGE)
      })
    //   .catch(error => {
    //     setError(error.message)
    //   })
  }

  return (
    <div className="auth__form--google">
      <button className="button button--auth__form" type="button" onClick={() => onSubmit()}>
        <div className="auth__form--google-icon"></div>
        <div className="auth__form--google-title">Google Sign In</div>
      </button>
    </div>
  )
}

const SignInWithGoogleForm = compose(withUserContent, withRouter)(SignInWithGoogleBase)

export default SignInWithGoogleForm

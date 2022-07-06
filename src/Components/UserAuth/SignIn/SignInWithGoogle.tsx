import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import * as ROLES from 'Utils/Constants/roles'
import * as ROUTES from 'Utils/Constants/routes'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import {
  LOCAL_STORAGE_KEY_WATCHING_SHOWS,
  LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES,
} from 'Components/AppContext/Contexts/LocalStorageContentContext/@Types'
import { LocalStorageHandlersContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { AuthUserGoogleSignInInterface } from '../Session/Authentication/@Types'

const mobileLayout = 1000

const SignInWithGoogleForm = () => {
  const { firebase } = useFrequentVariables()
  const localStorageHandlers = useContext(LocalStorageHandlersContext)

  const [windowSize, setWindowSize] = useState(window.innerWidth)
  const history = useHistory()

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [])

  const onSubmit = (provider: any) => {
    const signInType = windowSize < mobileLayout ? 'signInWithRedirect' : 'signInWithPopup'

    firebase.app
      .auth()
      [signInType](provider)
      .then((authUser: AuthUserGoogleSignInInterface) => {
        // context.userContentHandler.handleLoadingShowsOnRegister(true)

        firebase
          .user(authUser.user.uid)
          .update({
            username: authUser.user.displayName,
            userNameLowerCase: authUser.user.displayName.toLowerCase(),
            email: authUser.user.email,
            role: authUser.user.email === process.env.REACT_APP_ADMIN_EMAIL ? ROLES.ADMIN : ROLES.USER,
          })
          .then(() => {
            if (!authUser.additionalUserInfo.isNewUser) {
              // context.userContentHandler.handleLoadingShowsOnRegister(false)
              return
            }

            const watchingShows = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)!) || []
            const watchLaterMovies = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)!) || []

            // context.userContentHandler.addShowsToDatabaseOnRegister({
            //   shows: watchingShows,
            //   uid: authUser.user.uid,
            // })

            // watchLaterMovies.forEach((item: MovieInterface) => {
            //   context.userContentHandler.handleMovieInDatabases({
            //     id: item.id,
            //     data: item,
            //     onRegister: true,
            //     userOnRegister: authUser.user,
            //   })
            // })
          })
          .finally(() => {
            localStorageHandlers.clearLocalStorageContent()
          })
      })
      .then(() => {
        history.push(ROUTES.HOME_PAGE)
      })
      .catch((error: any) => {
        // context.userContentHandler.handleLoadingShowsOnRegister(false)
        console.log(error)
      })
  }

  return (
    <div className="auth__form--google">
      <button
        className="button button--auth__form"
        type="button"
        onClick={() => onSubmit(new firebase.app.auth.GoogleAuthProvider())}
      >
        <div className="auth__form--google-icon" />
        <div className="auth__form--google-title">Google Sign In</div>
      </button>
    </div>
  )
}

export default SignInWithGoogleForm

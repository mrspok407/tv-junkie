import React, { useState, useEffect, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { LocalStorageValueContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { postUserDataOnRegisterScheme } from 'Components/Firebase/FirebasePostSchemes/Post/AuthenticationSchemes'
import { ErrorInterface, ErrorsHandlerContext } from 'Components/AppContext/Contexts/ErrorsContext'
import { AuthUserGoogleSignInInterface } from '../Session/Authentication/@Types'
import { formatEpisodesForUserDatabaseOnRegister, handleContentOnRegister } from '../Register/Helpers'
import useAuthListenerSubscriber from '../Session/Authentication/Hooks/useAuthListenerSubscriber'

const mobileLayout = 1000

const SignInWithGoogleForm = () => {
  const { firebase } = useFrequentVariables()
  const initializeAuthUserListener = useAuthListenerSubscriber()

  const handleError = useContext(ErrorsHandlerContext)

  const { watchingShows: watchingShowsLS, watchLaterMovies: watchLaterMoviesLS } = useContext(LocalStorageValueContext)

  const [windowSize, setWindowSize] = useState(window.innerWidth)
  const history = useHistory()

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [])

  const handleSuccessSubmit = () => {
    initializeAuthUserListener()
  }

  const onSubmit = async (provider: any) => {
    const signInType = windowSize < mobileLayout ? 'signInWithRedirect' : 'signInWithPopup'

    try {
      const authUser: AuthUserGoogleSignInInterface = await firebase.app.auth()[signInType](provider)

      if (!authUser.additionalUserInfo.isNewUser) {
        handleSuccessSubmit()
        return
      }

      const episodesData = await handleContentOnRegister(watchingShowsLS, firebase)
      const { episodesForUserDatabase, episodesInfoForUserDatabase } = formatEpisodesForUserDatabaseOnRegister(
        watchingShowsLS,
        episodesData,
      )

      const updateData = postUserDataOnRegisterScheme({
        authUserFirebase: authUser,
        userName: authUser.user.displayName,
        selectedShows: watchingShowsLS,
        watchLaterMovies: watchLaterMoviesLS,
        episodes: episodesForUserDatabase,
        episodesInfo: episodesInfoForUserDatabase,
        firebase,
      })
      return firebase.rootRef().update(updateData, handleSuccessSubmit)
    } catch (err) {
      const error = err as ErrorInterface
      handleError({ errorData: error, message: 'Error occured durring register process. Please try again.' })
    } finally {
      history.push(ROUTES.HOME_PAGE)
    }
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

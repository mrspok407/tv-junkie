import React, { useEffect, useContext } from 'react'
import * as ROUTES from 'Utils/Constants/routes'
import { useHistory } from 'react-router-dom'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { LocalStorageValueContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { ErrorInterface, ErrorsHandlerContext, IGNORED_ERROR_CODES } from 'Components/AppContext/Contexts/ErrorsContext'
import { postUserDataOnRegisterScheme } from 'Components/Firebase/FirebasePostSchemes/Post/AuthenticationSchemes'
import useAuthListenerSubscriber from '../Session/Authentication/Hooks/useAuthListenerSubscriber'
import { formatEpisodesForUserDatabaseOnRegister, handleContentOnRegister } from '../Register/Helpers'
import { AuthUserGoogleSignInInterface } from '../Session/Authentication/@Types'

export const GoogleRedirectWrapper = ({ children }: { children: React.ReactNode }) => {
  useGoogleRedirect()
  return <>{children}</>
}

const useGoogleRedirect = () => {
  const { firebase } = useFrequentVariables()
  const handleError = useContext(ErrorsHandlerContext)

  const history = useHistory()
  const initializeAuthUserListener = useAuthListenerSubscriber()

  const { watchingShows: watchingShowsLS, watchLaterMovies: watchLaterMoviesLS } = useContext(LocalStorageValueContext)
  useEffect(() => {
    const handleGoogleRedirectAuth = async () => {
      let error: ErrorInterface['errorData'] = { message: '' }
      let authData: AuthUserGoogleSignInInterface | null = null
      try {
        authData = await firebase.app.auth().getRedirectResult()
        if (authData === null) return
        if (authData.user === null) return
        if (!authData.additionalUserInfo.isNewUser) {
          initializeAuthUserListener()
          return
        }

        const episodesData = await handleContentOnRegister(watchingShowsLS, firebase)
        const { episodesForUserDatabase, episodesInfoForUserDatabase } = formatEpisodesForUserDatabaseOnRegister(
          watchingShowsLS,
          episodesData,
        )

        const updateData = postUserDataOnRegisterScheme({
          authUserFirebase: authData,
          userName: authData.user.displayName,
          selectedShows: watchingShowsLS,
          watchLaterMovies: watchLaterMoviesLS,
          episodes: episodesForUserDatabase,
          episodesInfo: episodesInfoForUserDatabase,
          firebase,
        })
        return firebase.rootRef().update(updateData, initializeAuthUserListener)
      } catch (err) {
        error = err as ErrorInterface['errorData']
        handleError({ errorData: error, message: 'Error occurred during register process. Please try again.' })
      } finally {
        if (authData?.user !== null) {
          if (!IGNORED_ERROR_CODES.includes(error?.code!)) {
            history.push(ROUTES.HOME_PAGE)
          }
        }
      }
    }

    handleGoogleRedirectAuth()
  }, [firebase, handleError, history, initializeAuthUserListener, watchLaterMoviesLS, watchingShowsLS])
}

export default useGoogleRedirect

import { useEffect, useContext } from 'react'
import { FirebaseContext } from 'Components/Firebase'
import { AppContext } from 'Components/AppContext/ContextsWrapper'
import { MovieInterface } from 'Components/AppContext/@Types'
import * as ROLES from 'Utils/Constants/roles'
import * as ROUTES from 'Utils/Constants/routes'
import { useHistory } from 'react-router-dom'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = 'watchingShowsLocalS'
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = 'watchLaterMoviesLocalS'

const useGoogleRedirect = () => {
  const { firebase } = useFrequentVariables()
  const context = useContext(AppContext)
  const history = useHistory()

  const clearLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)
    localStorage.removeItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)

    context.userContentLocalStorage.clearContentState()
  }

  useEffect(() => {
    // context.userContentHandler.handleLoadingShowsOnRegister(true)
    firebase.app
      .auth()
      .getRedirectResult()
      .then((result: any) => {
        if (!result.user) {
          // context.userContentHandler.handleLoadingShowsOnRegister(false)
          return
        }

        const authUserGoogle: any = result

        firebase
          .user(authUserGoogle.user.uid)
          .update({
            username: authUserGoogle.user.displayName,
            userNameLowerCase: authUserGoogle.user.displayName.toLowerCase(),
            email: authUserGoogle.user.email,
            role: authUserGoogle.user.email === process.env.REACT_APP_ADMIN_EMAIL ? ROLES.ADMIN : ROLES.USER,
          })
          .then(() => {
            if (!authUserGoogle.additionalUserInfo.isNewUser) {
              // context.userContentHandler.handleLoadingShowsOnRegister(false)
              return
            }

            const watchingShows = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)!) || []
            const watchLaterMovies = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)!) || []

            // context.userContentHandler.addShowsToDatabaseOnRegister({
            //   shows: watchingShows,
            //   uid: authUserGoogle.user.uid,
            // })

            // watchLaterMovies.forEach((item: MovieInterface) => {
            //   context.userContentHandler.handleMovieInDatabases({
            //     id: item.id,
            //     data: item,
            //     onRegister: true,
            //     userOnRegister: authUserGoogle.user,
            //   })
            // })
          })
          .then(() => {
            clearLocalStorage()
          })
          .then(() => {
            history.push(ROUTES.HOME_PAGE)
          })
          .catch(() => {
            clearLocalStorage()
            // context.userContentHandler.handleLoadingShowsOnRegister(false)
          })
      })
      .catch((error: any) => {
        // context.userContentHandler.handleLoadingShowsOnRegister(false)
        console.log(error)
      })
  }, [firebase]) // eslint-disable-line react-hooks/exhaustive-deps
}

export default useGoogleRedirect

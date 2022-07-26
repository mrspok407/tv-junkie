import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import sortDataSnapshot from '../../../FirebaseHelpers/sortDataSnapshot'
import { handleMoviesError } from '../../ErrorHandlers/handleMoviesError'
import { setUserMovies } from '../../userMoviesSliceRed'

export const fetchUserMovies =
  (firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    console.log('fetchUserMovies')
    const authUserUid = getAuthUidFromState(getState())
    try {
      const userMoviesSnapshot = await firebase
        .moviesInfoUserDatabase(authUserUid)
        .orderByChild('timeStamp')
        .once('value')
      console.log({ userShowsSnapshot: userMoviesSnapshot.val() })
      const userMovies = sortDataSnapshot<ReturnType<typeof userMoviesSnapshot.val>>(userMoviesSnapshot)!
      console.log({ userMovies })
      dispatch(setUserMovies(userMovies))
    } catch (err) {
      console.log({ err })
      dispatch(handleMoviesError(err))
    }
  }

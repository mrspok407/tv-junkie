import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserMovieScheme } from 'Components/Firebase/FirebasePostSchemes/Post/ContentSchemes'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { handleMoviesError } from '../../ErrorHandlers/handleMoviesError'
import { selectMovie } from '../../userMoviesSliceRed'

interface HandleDatabaseChange {
  id: number
  firebase: FirebaseInterface
}

interface HandleNewShow extends HandleDatabaseChange {
  movieDetailesTMDB: MainDataTMDB
}

export const handleMovieInDatabase =
  ({ id, movieDetailesTMDB, firebase }: HandleNewShow): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const movieFromStore = selectMovie(getState(), id)

    try {
      if (movieFromStore) {
        firebase.userMovie({ authUid, key: id }).set(null)
        return
      }

      const updateData = postUserMovieScheme({ authUid, movieDetailesTMDB, firebase })
      return firebase.rootRef().update(updateData)
    } catch (err) {
      dispatch(handleMoviesError(err))
    }
  }

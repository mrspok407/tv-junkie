import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserMovieScheme } from 'Components/Firebase/FirebasePostSchemes/Post/ContentSchemes'
import { formatMovieForPostFirebase } from 'Components/Firebase/FirebasePostSchemes/Post/Helpers'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { handleMoviesError } from '../../ErrorHandlers/handleMoviesError'
import { optimisticAddMovie, optimisticRemoveMovie, optimisticUpdateMovieFinished } from '../../OptimisticHandlers'
import { selectMovie, updateLoadingMovie } from '../../userMoviesSliceRed'

interface HandleMovieDatabase {
  movieId: number
  firebase: FirebaseInterface
}
interface HandleNewMovie extends HandleMovieDatabase {
  movieDetailsTMDB: MainDataTMDB
}

export const handleAddMovieToDatabase =
  ({ movieId, movieDetailsTMDB, firebase }: HandleNewMovie): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())

    dispatch(
      optimisticAddMovie({
        data: formatMovieForPostFirebase({ data: movieDetailsTMDB, firebase }),
      }),
    )

    try {
      const updateData = postUserMovieScheme({ authUid, movieDetailsTMDB, firebase })
      return firebase.rootRef().update(updateData)
    } catch (err) {
      dispatch(optimisticRemoveMovie({ movieId }))
      dispatch(handleMoviesError(err))
    } finally {
      dispatch(updateLoadingMovie(false))
    }
  }

export const handleRemoveMovieFromDatabase =
  ({ movieId, firebase }: HandleMovieDatabase): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const movieFromStore = selectMovie(getState(), movieId)
    if (!movieFromStore) return

    dispatch(optimisticRemoveMovie({ movieId }))

    try {
      return await firebase.userMovie({ authUid, key: movieId }).set(null)
    } catch (err) {
      dispatch(optimisticAddMovie({ data: movieFromStore }))
      dispatch(handleMoviesError(err))
    } finally {
      dispatch(updateLoadingMovie(false))
    }
  }

export const updateMovieFinished =
  ({ movieId, firebase }: HandleMovieDatabase): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const movieFromStore = selectMovie(getState(), movieId)

    if (!movieFromStore) return

    dispatch(optimisticUpdateMovieFinished({ data: { ...movieFromStore, finished: !movieFromStore.finished } }))
    try {
      return await firebase.userMovie({ authUid, key: movieId }).update({ finished: !movieFromStore.finished })
    } catch (err) {
      dispatch(optimisticUpdateMovieFinished({ data: movieFromStore }))
      dispatch(handleMoviesError(err))
    }
  }

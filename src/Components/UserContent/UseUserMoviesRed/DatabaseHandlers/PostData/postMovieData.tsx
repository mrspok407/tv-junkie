import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserMovieScheme } from 'Components/Firebase/FirebasePostSchemes/Post/ContentSchemes'
import { formatMovieForPostFirebase } from 'Components/Firebase/FirebasePostSchemes/Post/Helpers'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { batch } from 'react-redux'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { handleMoviesError } from '../../ErrorHandlers/handleMoviesError'
import { optimisticAddMovie, optimisticRemoveMovie, optimisticUpdateMovieFinished } from '../../OptimisticHandlers'
import { selectMovie, updateLoadingMovie } from '../../userMoviesSliceRed'

interface HandleMovieDatabase {
  movieId: number
  firebase: FirebaseInterface
}

interface HandleNewMovie extends HandleMovieDatabase {
  movieDetailesTMDB: MainDataTMDB
}

export const handleAddMovieToDatabase =
  ({ movieId, movieDetailesTMDB, firebase }: HandleNewMovie): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())

    dispatch(
      optimisticAddMovie({
        data: formatMovieForPostFirebase({ data: movieDetailesTMDB, firebase }),
      }),
    )

    try {
      const updateData = postUserMovieScheme({ authUid, movieDetailesTMDB, firebase })
      return firebase.rootRef().update(updateData)
    } catch (err) {
      batch(() => {
        dispatch(optimisticRemoveMovie({ movieId }))
        dispatch(handleMoviesError(err))
      })
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
      batch(() => {
        dispatch(optimisticAddMovie({ data: movieFromStore }))
        dispatch(handleMoviesError(err))
      })
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
      batch(() => {
        dispatch(optimisticUpdateMovieFinished({ data: movieFromStore }))
        dispatch(handleMoviesError(err))
      })
    }
  }

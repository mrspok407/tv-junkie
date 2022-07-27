import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postUserMovieScheme } from 'Components/Firebase/FirebasePostSchemes/Post/ContentSchemes'
import { formatMovieForPostFirebase } from 'Components/Firebase/FirebasePostSchemes/Post/Helpers'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { batch } from 'react-redux'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { handleMoviesError } from '../../ErrorHandlers/handleMoviesError'
import { optimisticAddNewMovie, optimisticRemoveMovie, optimisticUpdateMovieFinished } from '../../OptimisticHandlers'
import { selectMovie, updateLoadingMovie } from '../../userMoviesSliceRed'

interface HandleMovieDatabase {
  id: number
  firebase: FirebaseInterface
}

interface HandleNewMovie extends HandleMovieDatabase {
  movieDetailesTMDB: MainDataTMDB
}

export const handleAddMovieToDatabase =
  ({ id, movieDetailesTMDB, firebase }: HandleNewMovie): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())

    dispatch(
      optimisticAddNewMovie({
        data: formatMovieForPostFirebase({ data: movieDetailesTMDB, firebase }),
      }),
    )

    try {
      const updateData = postUserMovieScheme({ authUid, movieDetailesTMDB, firebase })
      return firebase.rootRef().update(updateData)
    } catch (err) {
      batch(() => {
        dispatch(optimisticRemoveMovie({ movieId: id }))
        dispatch(handleMoviesError(err))
      })
    } finally {
      dispatch(updateLoadingMovie(false))
    }
  }

export const handleRemoveMovieFromDatabase =
  ({ id, firebase }: HandleMovieDatabase): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const movieFromStore = selectMovie(getState(), id)

    dispatch(optimisticRemoveMovie({ movieId: id }))

    try {
      return await firebase.userMovie({ authUid, key: id }).set(null)
    } catch (err) {
      batch(() => {
        dispatch(optimisticAddNewMovie({ data: movieFromStore }))
        dispatch(handleMoviesError(err))
      })
    } finally {
      dispatch(updateLoadingMovie(false))
    }
  }

export const updateMovieFinished =
  ({ id, firebase }: HandleMovieDatabase): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const movieFromStore = selectMovie(getState(), id)

    if (!movieFromStore) return

    dispatch(optimisticUpdateMovieFinished({ data: { ...movieFromStore, finished: !movieFromStore.finished } }))
    try {
      return await firebase.userMovie({ authUid, key: id }).update({ finished: !movieFromStore.finished })
    } catch (err) {
      batch(() => {
        dispatch(optimisticUpdateMovieFinished({ data: movieFromStore }))
        dispatch(handleMoviesError(err))
      })
    }
  }

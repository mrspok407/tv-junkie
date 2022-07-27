import { AppThunk } from 'app/store'
import { LocalStorageContentInt } from 'Components/AppContext/Contexts/LocalStorageContentContext/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { handleAddMovieToDatabase, handleRemoveMovieFromDatabase } from '../DatabaseHandlers/PostData/postMovieData'
import { selectLoadingMovie, selectMovie, updateLoadingMovie } from '../userMoviesSliceRed'

type Props = {
  movieId: number
  movieFullDetailes: MainDataTMDB
  firebase: FirebaseInterface
  localStorageHandlers: LocalStorageContentInt['handlers']
}

export const handleMovie =
  ({ movieId, movieFullDetailes, firebase, localStorageHandlers }: Props): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const movieFromStore = selectMovie(getState(), movieId)

    if (!authUid) {
      localStorageHandlers.toggleMovie({
        id: Number(movieId),
        data: movieFullDetailes,
      })
      return
    }

    if (selectLoadingMovie(getState())) return
    dispatch(updateLoadingMovie(true))

    if (movieFromStore) {
      dispatch(handleRemoveMovieFromDatabase({ id: Number(movieId), firebase }))
    } else {
      dispatch(handleAddMovieToDatabase({ id: Number(movieId), movieDetailesTMDB: movieFullDetailes, firebase }))
    }
  }

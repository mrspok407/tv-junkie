import { AppThunk } from 'app/store'
import { LocalStorageContentInt } from 'Components/AppContext/Contexts/LocalStorageContentContext/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { MovieInfoStoreState } from '../@Types'
import { handleAddMovieToDatabase, handleRemoveMovieFromDatabase } from '../DatabaseHandlers/PostData/postMovieData'
import { selectLoadingMovie, selectMovie, updateLoadingMovie } from '../userMoviesSliceRed'

type Props = {
  movieId: number
  movieFullDetails: MainDataTMDB
  firebase: FirebaseInterface
  localStorageHandlers: LocalStorageContentInt['handlers']
}

export const handleMovie =
  ({ movieId, movieFullDetails, firebase, localStorageHandlers }: Props): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const movieFromStore = selectMovie(getState(), movieId)
    const isLoadingMovie = selectLoadingMovie(getState())

    if (!authUid) {
      localStorageHandlers.toggleMovie({
        id: movieId,
        data: movieFullDetails,
      })
      return
    }

    if (isLoadingMovie) return
    dispatch(updateLoadingMovie(true))

    if (movieFromStore) {
      dispatch(handleRemoveMovieFromDatabase({ movieId, firebase }))
    } else {
      dispatch(handleAddMovieToDatabase({ movieId, movieDetailsTMDB: movieFullDetails, firebase }))
    }
  }

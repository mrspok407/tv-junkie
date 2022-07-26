import { AppThunk } from 'app/store'
import { LocalStorageContentInt } from 'Components/AppContext/Contexts/LocalStorageContentContext/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { handleMovieInDatabase } from '../DatabaseHandlers/PostData/postMovieData'
import { selectMovie } from '../userMoviesSliceRed'

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

    if (!authUid) {
      localStorageHandlers.toggleMovie({
        id: Number(movieId),
        data: movieFullDetailes,
      })
      return
    }

    dispatch(handleMovieInDatabase({ id: Number(movieId), movieDetailesTMDB: movieFullDetailes, firebase }))

    // if (movieFromStore.database === database) return
    // dispatch(
    //   updateUserShowStatus({
    //     id: showId,
    //     database,
    //     firebase,
    //   }),
    // )
  }

import { AppThunk } from 'app/store'
import { MovieInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { addNewMovie, changeMovie, removeMovie } from '../userMoviesSliceRed'

interface OptimisticAddNewMovieInt {
  data: MovieInfoFromUserDatabase
}

interface OptimisticRemoveMovieInt {
  movieId: number
}

export const optimisticAddNewMovie =
  ({ data }: OptimisticAddNewMovieInt): AppThunk =>
  async (dispatch) => {
    dispatch(addNewMovie({ ...data }))
  }

export const optimisticRemoveMovie =
  ({ movieId }: OptimisticRemoveMovieInt): AppThunk =>
  async (dispatch) => {
    dispatch(removeMovie(movieId))
  }

export const optimisticUpdateMovieFinished =
  ({ data }: OptimisticAddNewMovieInt): AppThunk =>
  async (dispatch) => {
    dispatch(changeMovie(data))
  }

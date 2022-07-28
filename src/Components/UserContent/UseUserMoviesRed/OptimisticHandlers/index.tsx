import { AppThunk } from 'app/store'
import { MovieInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { addMovie, changeMovie, removeMovie } from '../userMoviesSliceRed'

interface OptimisticAddNewMovieInt {
  data: MovieInfoFromUserDatabase
}

interface OptimisticRemoveMovieInt {
  movieId: number
}

export const optimisticAddMovie =
  ({ data }: OptimisticAddNewMovieInt): AppThunk =>
  async (dispatch) => {
    dispatch(addMovie({ ...data }))
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

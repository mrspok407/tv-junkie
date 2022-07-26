import { AppThunk } from 'app/store'
import { ErrorInterface } from 'Components/AppContext/Contexts/ErrorsContext'
import { setMoviesError } from '../userMoviesSliceRed'

export const handleMoviesError =
  (err: unknown): AppThunk =>
  async (dispatch) => {
    const error = err as ErrorInterface
    dispatch(setMoviesError({ message: error.message, errorData: error }))
  }

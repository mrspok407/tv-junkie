import { AppThunk } from 'app/store'
import { ErrorInterface } from 'Components/AppContext/Contexts/ErrorsContext'
import { setShowsError } from '../userShowsSliceRed'

export const handleShowsError =
  (err: unknown): AppThunk =>
  async (dispatch) => {
    const error = err as ErrorInterface
    dispatch(setShowsError({ message: error.message, errorData: error }))
  }

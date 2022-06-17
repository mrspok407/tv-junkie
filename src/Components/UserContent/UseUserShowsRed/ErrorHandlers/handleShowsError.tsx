import { AppThunk } from 'app/store'
import { ErrorInterface } from 'Utils/Hooks/UseErrors/UseErrors'
import { setShowsError } from '../userShowsSliceRed'

export const handleShowsError =
  (err: unknown): AppThunk =>
  async (dispatch) => {
    const error = err as ErrorInterface
    dispatch(setShowsError({ message: error.message, errorData: error }))
  }

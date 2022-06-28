import { AppThunk } from 'app/store'
import { resetShows } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { batch } from 'react-redux'
import { resetAuthUser } from '../authUserSlice'
import authUserLocalHandler from '../LocalStorageHandler/authUserLocalHandler'

export const logoutAuthUser = (): AppThunk => async (dispatch) => {
  const { removeAuthLocal } = authUserLocalHandler()
  removeAuthLocal()
  batch(() => {
    dispatch(resetAuthUser())
    dispatch(resetShows())
  })
}

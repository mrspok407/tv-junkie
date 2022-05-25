import { AppThunk } from 'app/store'
import { resetShows } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { batch } from 'react-redux'
import { resetAuthUser } from '../authUserSlice'

export const logoutAuthUser = (): AppThunk => async (dispatch) => {
  //   batch(() => {

  //   })
  dispatch(resetAuthUser())
  dispatch(resetShows())
}

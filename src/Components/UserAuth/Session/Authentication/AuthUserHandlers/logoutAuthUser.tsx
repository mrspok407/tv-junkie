import { AppThunk } from 'app/store'
import { resetSlicesState } from 'Components/UserContent/SharedActions'
import authUserLocalHandler from '../LocalStorageHandler/authUserLocalHandler'

export const logoutAuthUser = (): AppThunk => async (dispatch) => {
  const { removeAuthLocal } = authUserLocalHandler()
  removeAuthLocal()
  dispatch(resetSlicesState())
}

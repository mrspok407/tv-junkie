import { AppThunk } from 'app/store'
import { UserShowStatuses } from '../@Types'
import { changeUserShowStatus } from '../userShowsSliceRed'

type Props = {
  id: number
  userShowStatus: UserShowStatuses
}

export const optimisticChangeUserShowStatus =
  ({ id, userShowStatus }: Props): AppThunk =>
  async (dispatch) => {
    return dispatch(changeUserShowStatus({ id, userShowStatus }))
  }

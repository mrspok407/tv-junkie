import { AppThunk } from 'app/store'
import { LocalStorageContentInt } from 'Components/AppContext/Contexts/LocalStorageContentContext/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { UserShowStatuses } from '../@Types'
import { handleNewShowInDatabase, updateUserShowStatus } from '../DatabaseHandlers/PostData/postShowData'
import { selectShow } from '../userShowsSliceRed'

type Props = {
  showId: number
  database: UserShowStatuses
  showFullDetails: MainDataTMDB
  firebase: FirebaseInterface
  localStorageHandlers: LocalStorageContentInt['handlers']
}

export const handleUserShowStatus =
  ({ showId, database, showFullDetails, firebase, localStorageHandlers }: Props): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), showId)

    if (!authUid) {
      localStorageHandlers.toggleShow({
        id: Number(showId),
        data: showFullDetails,
        userShowStatus: database,
      })
      return
    }

    if (!showFromStore) {
      dispatch(handleNewShowInDatabase({ id: showId, database, showDetailsTMDB: showFullDetails, firebase }))
      return
    }

    if (showFromStore.database === database) return
    dispatch(
      updateUserShowStatus({
        id: showId,
        database,
        firebase,
      }),
    )
  }

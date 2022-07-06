import { AppThunk } from 'app/store'
import { LocalStorageContentInt } from 'Components/AppContext/Contexts/LocalStorageContentContext/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { UserShowStatuses } from '../@Types'
import { handleNewShowInDatabase, updateUserShowStatus } from '../DatabaseHandlers/PostData/postShowsData'
import { selectShow } from '../userShowsSliceRed'

type Props = {
  id: number
  database: UserShowStatuses
  showFullDetailes: MainDataTMDB
  firebase: FirebaseInterface
  localStorageHandlers: LocalStorageContentInt['handlers']
}

export const handleUserShowStatus =
  ({ id, database, showFullDetailes, firebase, localStorageHandlers }: Props): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    if (!authUid) {
      localStorageHandlers.toggleShow({
        id: Number(id),
        data: showFullDetailes,
        userShowStatus: database,
      })
      return
    }

    if (!showFromStore) {
      dispatch(handleNewShowInDatabase({ id, database, showDetailesTMDB: showFullDetailes, firebase }))
      return
    }

    if (showFromStore.database === database) return
    dispatch(
      updateUserShowStatus({
        id,
        database,
        showDetailesTMDB: showFullDetailes,
        firebase,
      }),
    )
  }

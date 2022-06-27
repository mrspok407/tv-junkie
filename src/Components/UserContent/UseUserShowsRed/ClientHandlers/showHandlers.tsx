import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import useUserContentLocalStorage from 'Components/UserContent/UseUserContentLocalStorage'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { UserShowStatuses } from '../@Types'
import { handleNewShowInDatabase, updateUserShowStatus } from '../DatabaseHandlers/PostData/postShowsData'
import { selectShow } from '../userShowsSliceRed'

type Props = {
  id: number
  database: UserShowStatuses
  showDetailesTMDB: MainDataTMDB
  firebase: FirebaseInterface
  localStorageHandlers: ReturnType<typeof useUserContentLocalStorage>
}

export const handleUserShowStatus =
  ({ id, database, showDetailesTMDB, firebase, localStorageHandlers }: Props): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    if (!authUid) {
      localStorageHandlers.toggleShowLS({
        id: Number(id),
        data: showDetailesTMDB,
        database,
      })
      return
    }

    if (!showFromStore) {
      dispatch(handleNewShowInDatabase({ id, database, showDetailesTMDB, firebase }))
      return
    }

    if (showFromStore.database === database) return
    dispatch(
      updateUserShowStatus({
        id,
        database,
        showDetailesTMDB,
        firebase,
      }),
    )
  }

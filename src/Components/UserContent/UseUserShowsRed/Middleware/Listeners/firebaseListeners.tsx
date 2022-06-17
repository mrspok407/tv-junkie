import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { EpisodesFromUserDatabase, ShowInfoFromUserDatabase, SnapshotVal } from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import { handleNewShow, handleChangeShow } from '../HandleData/handleShowsData'
import { changeShowEpisodes, selectShow, selectShowsIds } from '../../userShowsSliceRed'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'

interface UserShowsListeners {
  firebase: FirebaseInterface
}

export const userShowsListeners =
  ({ firebase }: UserShowsListeners): AppThunk =>
  async (dispatch, getState) => {
    console.log('userShowsListeners')
    const authUserUid = getAuthUidFromState(getState())

    const showsInfoRef = firebase.showsInfoUserDatabase(authUserUid).orderByChild('timeStamp')
    const showsEpisodesRef = firebase.showsEpisodesUserDatabase(authUserUid)

    const showsIds = selectShowsIds(getState())
    const lastTimestamp = showsIds.length ? selectShow(getState(), showsIds[showsIds.length - 1])?.timeStamp : 0

    showsInfoRef.startAfter(lastTimestamp).on(
      'child_added',
      async (snapshot: SnapshotVal<ShowInfoFromUserDatabase>) => {
        console.log('child_added')
        dispatch(handleNewShow({ ...snapshot.val()!, key: snapshot.key }, firebase))
      },
      (err) => dispatch(handleShowsError(err)),
    )

    showsInfoRef.on(
      'child_changed',
      (snapshot: SnapshotVal<ShowInfoFromUserDatabase>) => {
        console.log('child_changed info listener')
        dispatch(handleChangeShow({ ...snapshot.val()!, key: snapshot.key }, firebase))
      },
      (err) => dispatch(handleShowsError(err)),
    )

    showsEpisodesRef.on(
      'child_changed',
      (snapshot: SnapshotVal<EpisodesFromUserDatabase>) => {
        console.log('child_change episodes listener')
        dispatch(changeShowEpisodes({ id: Number(snapshot.key), data: snapshot.val()! }))
      },
      (err) => dispatch(handleShowsError(err)),
    )
  }

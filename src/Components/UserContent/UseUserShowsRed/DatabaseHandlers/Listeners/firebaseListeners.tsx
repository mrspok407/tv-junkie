import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { EpisodesFromUserDatabase, ShowInfoFromUserDatabase, SnapshotVal } from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { handleNewShow, handleChangeShow, handleChangeEpisodes } from '../HandleData/handleShowsData'
import { selectShow, selectShowsIds } from '../../userShowsSliceRed'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'

interface UserShowsListeners {
  firebase: FirebaseInterface
}

export const userShowsListenersRefs = (
  firebase: FirebaseInterface,
  authUserUid: AuthUserInterface['authUser']['uid'],
) => {
  return {
    showsInfoRef: firebase.showsInfoUserDatabase(authUserUid),
    showsEpisodesRef: firebase.showsEpisodesUserDatabase(authUserUid),
  }
}

export const userShowsListeners =
  ({ firebase }: UserShowsListeners): AppThunk =>
  async (dispatch, getState) => {
    console.log('userShowsListeners')
    const authUserUid = getAuthUidFromState(getState())
    const { showsInfoRef, showsEpisodesRef } = userShowsListenersRefs(firebase, authUserUid)

    const showsIds = selectShowsIds(getState())
    const lastTimestamp = selectShow(getState(), showsIds[showsIds.length - 1])?.timeStamp ?? 0
    console.log({ lastTimestamp })
    showsInfoRef
      .orderByChild('timeStamp')
      .startAfter(lastTimestamp)
      .on(
        'child_added',
        async (snapshot: SnapshotVal<ShowInfoFromUserDatabase>) => {
          console.log('child_added')
          dispatch(handleNewShow({ ...snapshot.val()!, key: snapshot.key }, firebase))
        },
        (err) => {
          console.log({ errAddedListener: err })
          dispatch(handleShowsError(err))
        },
      )

    showsInfoRef.orderByChild('timeStamp').on(
      'child_changed',
      (snapshot: SnapshotVal<ShowInfoFromUserDatabase>) => {
        console.log('child_changed info listener')
        console.log(snapshot.val())
        dispatch(handleChangeShow({ ...snapshot.val()!, key: snapshot.key }, firebase))
      },
      (err) => {
        console.log({ errInfoListener: err })
        dispatch(handleShowsError(err))
      },
    )

    showsEpisodesRef.on(
      'child_changed',
      async (snapshot: SnapshotVal<EpisodesFromUserDatabase>) => {
        console.log('child_change episodes listener')
        console.log(snapshot.val())
        dispatch(handleChangeEpisodes(Number(snapshot.key), snapshot.val()!.episodes, firebase))
      },
      (err) => {
        console.log({ errEpisodesListener: err })
        dispatch(handleShowsError(err))
      },
    )
  }

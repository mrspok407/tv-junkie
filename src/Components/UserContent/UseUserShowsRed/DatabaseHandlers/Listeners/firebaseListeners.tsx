import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { EpisodesFromUserDatabase, ShowInfoFromUserDatabase, SnapshotVal } from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { handleNewShow, handleChangeShow } from '../HandleData/handleShowsData'
import { changeShowEpisodes, selectShow, selectShowsIds } from '../../userShowsSliceRed'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import { EpisodesStoreState } from '../../@Types'

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

    // const showsInfoRef = firebase.showsInfoUserDatabase(authUserUid).orderByChild('timeStamp')
    // const showsEpisodesRef = firebase.showsEpisodesUserDatabase(authUserUid)

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
        // await dispatch(changeShowEpisodes({ id: Number(snapshot.key), episodes: snapshot.val()!.episodes })).then(
        dispatch(testThunk({ id: Number(snapshot.key), episodes: snapshot.val()!.episodes })).then((res: any) =>
          console.log({ res }),
        )
      },
      (err) => {
        console.log({ errEpisodesListener: err })
        dispatch(handleShowsError(err))
      },
    )
  }

export const testThunk =
  ({ id, episodes }: { id: any; episodes: any }): AppThunk<Promise<EpisodesStoreState>> =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())

    return dispatch(changeShowEpisodes({ id, episodes }))
  }

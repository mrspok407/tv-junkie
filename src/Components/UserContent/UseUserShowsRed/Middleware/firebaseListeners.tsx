import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { EpisodesFromFireDatabase, EpisodesFromUserDatabase, SnapshotVal } from 'Components/Firebase/@TypesFirebase'
import { handleNewShow, handleChangeShow } from './showHandlers'
import { changeShowEpisodes, selectShow, selectShowsIds } from '../userShowsSliceRed'
import { ShowInfoStoreState } from '../@Types'

interface UserShowsListeners {
  firebase: FirebaseInterface
  uid: string
}

export const userShowsListeners =
  ({ uid, firebase }: UserShowsListeners): AppThunk =>
  async (dispatch, getState) => {
    console.log('userShowsListeners')
    const firebaseRef = firebase.showsInfoUserDatabase(uid).orderByChild('timeStamp')

    const showsIds = selectShowsIds(getState())
    const lastTimestamp = showsIds.length ? selectShow(getState(), showsIds[showsIds.length - 1])?.timeStamp : 0

    firebaseRef.startAfter(lastTimestamp).on('child_added', async (snapshot: any) => {
      console.log('child_added')
      dispatch(handleNewShow({ ...snapshot.val(), key: snapshot.key }, uid, firebase))
    })

    firebaseRef.on('child_changed', (snapshot: SnapshotVal<ShowInfoStoreState>) => {
      console.log('child_changed')
      dispatch(handleChangeShow(snapshot.val()!, uid, firebase))
    })

    firebase
      .userEpisodes(uid)
      .on('child_changed', (snapshot: SnapshotVal<{ episodes: EpisodesFromUserDatabase['episodes'] }>) => {
        dispatch(changeShowEpisodes({ id: Number(snapshot.key), episodes: snapshot.val()!.episodes }))
      })
  }

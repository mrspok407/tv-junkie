import { AppThunk } from 'app/store'
import { SnapshotVal } from 'Components/AppContext/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { handleNewShow, handleChangeShow } from './showHandlers'
import { changeShowEpisodes, selectShow, selectShowsIds } from '../userShowsSliceRed'
import { SeasonEpisodesFromDatabaseInterface, UserShowsInterface } from '../@Types'

interface UserShowsListeners {
  firebase: FirebaseInterface
  uid: string
}

export const userShowsListeners =
  ({ uid, firebase }: UserShowsListeners): AppThunk =>
  async (dispatch, getState) => {
    const firebaseRef = firebase.userAllShows(uid).orderByChild('timeStamp')

    const showsIds = selectShowsIds(getState())
    const lastTimestamp = selectShow(getState(), showsIds[showsIds.length - 1]).timeStamp

    firebaseRef.startAfter(lastTimestamp).on('child_added', async (snapshot: any) => {
      console.log('child_added')
      dispatch(handleNewShow({ ...snapshot.val(), key: snapshot.key }, uid, firebase))
    })

    firebaseRef.on('child_changed', (snapshot: SnapshotVal<UserShowsInterface>) => {
      console.log('child_changed')
      dispatch(handleChangeShow(snapshot.val(), uid, firebase))
    })

    firebase
      .userEpisodes(uid)
      .on('child_changed', (snapshot: SnapshotVal<{ episodes: SeasonEpisodesFromDatabaseInterface[] }>) => {
        dispatch(changeShowEpisodes({ id: Number(snapshot.key), episodes: snapshot.val().episodes }))
      })
  }
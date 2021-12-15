import { AppDispatch, AppThunk, RootState } from "app/store"
import { SnapshotVal } from "Components/AppContext/@Types"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { handleNewShow, handleChangeShow } from "./index"
import { changeShow, selectUserShow, selectUserShowsIds } from "../userShowsSliceRed"
import { UserShowsInterface } from "../@Types"

interface UserShowsListeners {
  firebase: FirebaseInterface
  uid: string
}

export const userShowsListeners =
  ({ uid, firebase }: UserShowsListeners): AppThunk =>
  async (dispatch, getState) => {
    const firebaseRef = firebase.userAllShows(uid).orderByChild("timeStamp")

    const showsIds = selectUserShowsIds(getState())
    const lastTimestamp = selectUserShow(getState(), showsIds[showsIds.length - 1]).timeStamp

    firebaseRef.startAfter(lastTimestamp).on("child_added", (snapshot: any) => {
      console.log("child_added")
      dispatch(handleNewShow({ ...snapshot.val(), key: snapshot.key }, uid, firebase))
    })

    firebaseRef.on("child_changed", (snapshot: SnapshotVal<UserShowsInterface>) => {
      console.log("child_changed")
      dispatch(handleChangeShow(snapshot.val(), uid, firebase))
    })
  }

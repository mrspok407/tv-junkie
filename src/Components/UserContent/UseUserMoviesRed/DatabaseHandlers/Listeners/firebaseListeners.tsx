import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { MovieInfoFromUserDatabase, SnapshotVal } from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { AuthUserInterface } from 'Components/UserAuth/Session/Authentication/@Types'
import { addMovie, changeMovie, removeMovie, selectMovie, selectMoviesIds } from '../../userMoviesSliceRed'
import { handleMoviesError } from '../../ErrorHandlers/handleMoviesError'

interface UserShowsListeners {
  firebase: FirebaseInterface
}

export const userMoviesListenersRefs = (
  firebase: FirebaseInterface,
  authUserUid: AuthUserInterface['authUser']['uid'],
) => {
  return {
    moviesInfoRef: firebase.moviesInfoUserDatabase(authUserUid),
  }
}

export const userMoviesListeners =
  ({ firebase }: UserShowsListeners): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())
    const { moviesInfoRef } = userMoviesListenersRefs(firebase, authUserUid)

    const moviesIds = selectMoviesIds(getState())
    const lastTimestamp = selectMovie(getState(), moviesIds[moviesIds.length - 1])?.timeStamp ?? 0

    moviesInfoRef
      .orderByChild('timeStamp')
      .startAfter(lastTimestamp)
      .on(
        'child_added',
        async (snapshot: SnapshotVal<MovieInfoFromUserDatabase>) => {
          dispatch(addMovie({ ...snapshot.val()!, key: snapshot.key }))
        },
        (err) => {
          console.log({ err })
          dispatch(handleMoviesError(err))
        },
      )

    moviesInfoRef.orderByChild('timeStamp').on(
      'child_removed',
      async (snapshot: SnapshotVal<MovieInfoFromUserDatabase>) => {
        dispatch(removeMovie(Number(snapshot.key)))
      },
      (err) => {
        console.log({ err })
        dispatch(handleMoviesError(err))
      },
    )

    moviesInfoRef.orderByChild('timeStamp').on(
      'child_changed',
      (snapshot: SnapshotVal<MovieInfoFromUserDatabase>) => {
        dispatch(changeMovie({ ...snapshot.val()!, key: snapshot.key }))
      },
      (err) => {
        console.log({ err })
        dispatch(handleMoviesError(err))
      },
    )
  }

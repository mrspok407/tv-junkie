import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { ErrorInterface } from 'Utils/Hooks/UseErrors/UseErrors'
import sortDataSnapshot from '../../../FirebaseHelpers/sortDataSnapshot'
import fetchShowsFullData from '../../FirebaseHelpers/FetchData/fetchShowsFullData'
import { selectShow, setShowsError, setShowEpisodes, setUserShows } from '../../userShowsSliceRed'
import { fetchEpisodesFullData } from '../../FirebaseHelpers/FetchData/fetchEpisodesFullData'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'

export const fetchUserShows =
  (firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    console.log('fetchUserShows')
    const authUserUid = getAuthUidFromState(getState())
    try {
      const userShowsSnapshot = await firebase
        .showsInfoUserDatabase(authUserUid)
        .orderByChild('timeStamp')
        .once('value')
      const userShows = sortDataSnapshot<ReturnType<typeof userShowsSnapshot.val>>(userShowsSnapshot)!
      const showsFullData = await fetchShowsFullData({ userShows, firebase, uid: authUserUid })
      dispatch(setUserShows(showsFullData))
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }

export const fetchShowEpisodes =
  (id: number, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    if (!showFromStore) return
    if (showFromStore.database === 'notWatchingShows' || showFromStore.episodesFetched) {
      console.log('fetchShowEpisodes earlyReturn')
      return
    }
    try {
      const episodes = await fetchEpisodesFullData({ uid: authUserUid, showKey: id, firebase })
      // const artificialDelay = new Promise((res) => {
      //   setTimeout(() => {
      //     return res(1)
      //   }, 2500)
      // })
      // await artificialDelay
      console.log('fetchShowEpisodes')
      dispatch(setShowEpisodes({ id, episodes }))
    } catch (err) {
      const error = err as ErrorInterface
      dispatch(setShowsError(error))
      throw new Error(error.message)
    }
  }

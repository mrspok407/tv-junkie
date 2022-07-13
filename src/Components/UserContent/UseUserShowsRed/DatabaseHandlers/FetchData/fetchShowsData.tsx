import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import sortDataSnapshot from '../../../FirebaseHelpers/sortDataSnapshot'
import fetchShowsFullData from '../../FirebaseHelpers/FetchData/fetchShowsFullData'
import { selectShow, setShowEpisodes, setUserShows } from '../../userShowsSliceRed'
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
      console.log({ userShowsSnapshot: userShowsSnapshot.val() })
      const userShows = sortDataSnapshot<ReturnType<typeof userShowsSnapshot.val>>(userShowsSnapshot)!
      const showsFullData = await fetchShowsFullData({ userShows, firebase, authUserUid })

      dispatch(setUserShows(showsFullData))
    } catch (err) {
      console.log({ err })
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
      const episodes = await fetchEpisodesFullData({ authUserUid, showKey: id, firebase })
      return dispatch(setShowEpisodes({ id, episodes }))
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }

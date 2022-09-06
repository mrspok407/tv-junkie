import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import sortDataSnapshot from '../../../FirebaseHelpers/sortDataSnapshot'
import fetchShowsFullData from '../../FirebaseHelpers/FetchData/fetchShowsFullData'
import { selectShow, setShowEpisodes, setUserShows } from '../../userShowsSliceRed'
import { fetchEpisodesFullData } from '../../FirebaseHelpers/FetchData/fetchEpisodesFullData'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import { updateIsEpisodesWatched } from '../../Utils'
import { EpisodesStoreState } from '../../@Types'

export const fetchUserShows =
  (firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())
    try {
      const userShowsSnapshot = await firebase
        .showsInfoUserDatabase(authUserUid)
        .orderByChild('timeStamp')
        .once('value')
      const userShows = sortDataSnapshot<ReturnType<typeof userShowsSnapshot.val>>(userShowsSnapshot)!
      const showsFullData = await fetchShowsFullData({ userShows, firebase, authUserUid })
      dispatch(setUserShows(showsFullData))
    } catch (err) {
      console.log(err)
      dispatch(handleShowsError(err))
    }
  }

export const fetchShowEpisodes =
  (id: number, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), id)

    if (!showFromStore || !authUserUid) return
    if (showFromStore.database === 'notWatchingShows' || showFromStore.episodesFetched) return

    try {
      const episodes = await fetchEpisodesFullData({ authUserUid, showKey: id, firebase })
      const [episodesFinalData, allReleasedEpisodesWatched] = updateIsEpisodesWatched<EpisodesStoreState>(episodes)
      return dispatch(setShowEpisodes({ id, episodes: episodesFinalData, allReleasedEpisodesWatched }))
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }

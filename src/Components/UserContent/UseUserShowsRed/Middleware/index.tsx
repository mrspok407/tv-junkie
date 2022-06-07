import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import merge from 'lodash.merge'
import { combineMergeObjects } from 'Utils'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import sortDataSnapshot from '../../FirebaseHelpers/sortDataSnapshot'
import { EpisodesStoreState, UserShowsInterface } from '../@Types'
import fetchShowsFullData from '../FirebaseHelpers/FetchData/fetchShowsFullData'
import { userShowsListeners } from './firebaseListeners'
import { selectShow, selectShowEpisodes, setError, setShowEpisodes, setUserShows } from '../userShowsSliceRed'
import { fetchEpisodesFullData } from '../FirebaseHelpers/FetchData'

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
      const mergedShows: UserShowsInterface[] = merge(showsFullData, userShows, {
        arrayMerge: combineMergeObjects,
      })
      console.log({ mergedShows: { ...mergedShows } })
      dispatch(setUserShows(mergedShows))
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const fetchShowEpisodes =
  (id: number, uid: string, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    if (!selectShow(getState(), id)) return
    if (selectShowEpisodes(getState(), id).length) {
      console.log('fetchShowEpisodes earlyReturn')
      return
    }
    try {
      const episodes = await fetchEpisodesFullData({ uid, showKey: id, firebase })
      console.log('fetchShowEpisodes')
      dispatch(setShowEpisodes({ id, episodes }))
    } catch (err) {
      dispatch(setError(err))
    }
  }

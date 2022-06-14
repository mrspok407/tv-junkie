import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import { ErrorInterface } from 'Utils/Hooks/UseErrors/UseErrors'
import sortDataSnapshot from '../../../FirebaseHelpers/sortDataSnapshot'
import fetchShowsFullData from '../../FirebaseHelpers/FetchData/fetchShowsFullData'
import { selectShow, selectShowEpisodes, setShowsError, setShowEpisodes, setUserShows } from '../../userShowsSliceRed'
import { fetchEpisodesFullData } from '../../FirebaseHelpers/FetchData/fetchEpisodesFullData'

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
      const error = err as ErrorInterface
      dispatch(setShowsError({ message: error.message, errorData: error }))
      throw new Error(error.message)
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
      const error = err as ErrorInterface
      dispatch(setShowsError(error))
      throw new Error(error.message)
    }
  }

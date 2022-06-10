import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { throwErrorNoData } from 'Components/Firebase/Errors'
import { ErrorInterface } from 'Utils/Hooks/UseErrors/UseErrors'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import { EpisodesStoreState } from '../@Types'
import { addNewShow, changeShow, selectShow, setShowsError } from '../userShowsSliceRed'
import { fetchEpisodesFullData } from '../FirebaseHelpers/FetchData'

export const handleNewShow =
  (showData: ShowInfoFromUserDatabase, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())

    const isWatchingShow = showData.database === 'watchingShows'
    try {
      let episodes: EpisodesStoreState[] = []
      const showInfoSnapshot = await firebase.showInfoFireDatabase(showData.id).once('value')
      if (showInfoSnapshot.val() === null) {
        throwErrorNoData()
      }

      if (isWatchingShow) {
        episodes = await fetchEpisodesFullData({ uid: authUserUid, showKey: showData.id, firebase })
      }
      const show = {
        ...showInfoSnapshot.val()!,
        ...showData,
        episodes,
        episodesFetched: isWatchingShow,
      }
      dispatch(addNewShow(show))
    } catch (err) {
      const errors = err as ErrorInterface
      dispatch(setShowsError(errors))
    }
  }

export const handleChangeShow =
  (showData: ShowInfoFromUserDatabase, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())

    const showFromStore = selectShow(getState(), showData.id)
    console.log({ showFromStore })
    if (!showFromStore) return

    const isWatchingShow = showData.database === 'watchingShows'
    const isEpisodesFetched = showFromStore.episodesFetched

    if (!isWatchingShow || isEpisodesFetched) {
      console.log('allready fetched')
      dispatch(changeShow(showData))
      return
    }

    try {
      const episodes = await fetchEpisodesFullData({ uid: authUserUid, showKey: showData.id, firebase })
      console.log('handleChangeShow after AWAIT')

      const show = { ...showData, episodes, episodesFetched: true }
      dispatch(changeShow(show))
    } catch (err) {
      const errors = err as ErrorInterface
      dispatch(setShowsError(errors))
    }
  }

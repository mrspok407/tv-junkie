import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { throwErrorNoData } from 'Components/Firebase/Errors'
import { ErrorInterface } from 'Utils/Hooks/UseErrors/UseErrors'
import { ShowInfoFromUserDatabase } from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/WithAuthentication/Helpers'
import { EpisodesStoreState } from '../../@Types'
import { addNewShow, changeShow, selectShow, setShowsError } from '../../userShowsSliceRed'
import { fetchEpisodesFullData } from '../../FirebaseHelpers/FetchData/fetchEpisodesFullData'

export const handleNewShow =
  (showData: ShowInfoFromUserDatabase, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())

    const isWatchingShow = showData.database === 'watchingShows'
    try {
      let episodes: EpisodesStoreState[] = []
      const showInfoFireSnapshot = await firebase.showInfoFireDatabase(showData.id).once('value')
      if (showInfoFireSnapshot.val() === null) {
        throwErrorNoData()
      }

      if (isWatchingShow) {
        episodes = await fetchEpisodesFullData({ uid: authUserUid, showKey: showData.id, firebase })
      }
      const show = {
        ...showInfoFireSnapshot.val()!,
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
    console.log({ isWatchingShow })
    if (!isWatchingShow || isEpisodesFetched) {
      console.log('allready fetched')
      dispatch(changeShow(showData))
      return
    }

    try {
      const episodes = await fetchEpisodesFullData({ uid: authUserUid, showKey: showData.id, firebase })
      console.log('handleChangeShow after AWAIT')

      const show = { info: { ...showFromStore, ...showData, episodesFetched: true }, episodes }
      dispatch(changeShow(show))
    } catch (err) {
      const errors = err as ErrorInterface
      dispatch(setShowsError(errors))
    }
  }

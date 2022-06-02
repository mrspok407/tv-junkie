import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { EpisodesFromFireDatabase, UserShowsInterface } from '../@Types'
import { addNewShow, changeShow, selectShow, setError } from '../userShowsSliceRed'
import { fetchEpisodesFullData } from '../FirebaseHelpers/FetchData'

export const handleNewShow =
  (showData: UserShowsInterface, uid: string, firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    const isWatchingShow = showData.database === 'watchingShows'
    try {
      let episodes: EpisodesFromFireDatabase[] = []
      const showInfoSnapshot = await firebase.showInfo(showData.id).once('value')
      if (showInfoSnapshot.val() === null) {
        throw new Error(
          "There's no data in database, by this path. And if this function is called the data should be here.\n" +
            'Find out the reason why the data is missing at the point of calling this function.',
        )
      }

      if (isWatchingShow) {
        episodes = await fetchEpisodesFullData({ uid, showKey: showData.id, firebase })
      }
      const show = {
        ...showInfoSnapshot.val(),
        ...showData,
        episodes,
        episodesFetched: isWatchingShow,
      }
      dispatch(addNewShow(show))
    } catch (err) {
      dispatch(setError(err))
    }
  }

export const handleChangeShow =
  (showData: UserShowsInterface, uid: string, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
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
      const episodes = await fetchEpisodesFullData({ uid, showKey: showData.id, firebase })
      console.log('handleChangeShow after AWAIT')

      const show = { ...showData, episodes, episodesFetched: true }
      dispatch(changeShow(show))
    } catch (err) {
      dispatch(setError(err))
    }
  }

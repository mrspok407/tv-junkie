import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { throwErrorNoData } from 'Components/Firebase/Errors'
import {
  EpisodesFromUserDatabase,
  ShowInfoFromUserDatabase,
  SingleEpisodeFromUserDatabase,
} from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { episodesToOneArray } from 'Utils/episodesToOneArray'
import { EpisodesStoreState } from '../../@Types'
import { addNewShow, changeShow, changeShowEpisodes, selectShow } from '../../userShowsSliceRed'
import { fetchEpisodesFullData } from '../../FirebaseHelpers/FetchData/fetchEpisodesFullData'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'

export const handleNewShow =
  (showData: ShowInfoFromUserDatabase, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())
    const shouldFetchEpisodes = showData.database !== 'notWatchingShows'

    try {
      let episodes: EpisodesStoreState[] = []
      const showInfoFireSnapshot = await firebase.showInfoFireDatabase(showData.id).once('value')
      if (showInfoFireSnapshot.val() === null) {
        throwErrorNoData()
      }

      if (shouldFetchEpisodes) {
        episodes = await fetchEpisodesFullData({ authUserUid, showKey: showData.id, firebase })
      }
      const show = {
        ...showInfoFireSnapshot.val()!,
        ...showData,
        episodes,
        episodesFetched: shouldFetchEpisodes,
      }
      dispatch(addNewShow(show))
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }

export const handleChangeShow =
  (showData: ShowInfoFromUserDatabase, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())
    const showFromStore = selectShow(getState(), showData.id)

    console.log({ showFromStore })
    if (!showFromStore) return
    if (showFromStore.episodesFetched) {
      console.log('allready fetched')
      console.log({ showData })
      const show = { info: { ...showFromStore, ...showData } }
      dispatch(changeShow(show))
      return
    }

    try {
      const episodes = await fetchEpisodesFullData({ authUserUid, showKey: showData.id, firebase })
      console.log('handleChangeShow after AWAIT')

      const show = { info: { ...showFromStore, ...showData, episodesFetched: true }, episodes }
      dispatch(changeShow(show))
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }

export const handleChangeEpisodes =
  (showId: number, episodes: EpisodesFromUserDatabase['episodes'], firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const isAnyEpisodeNotWatched = episodesToOneArray<SingleEpisodeFromUserDatabase>(episodes).some(
      (episode) => !episode.watched,
    )

    firebase.userShow({ authUid, key: showId }).update({ allEpisodesWatched: !isAnyEpisodeNotWatched })
    return dispatch(changeShowEpisodes({ showId, episodes }))
  }

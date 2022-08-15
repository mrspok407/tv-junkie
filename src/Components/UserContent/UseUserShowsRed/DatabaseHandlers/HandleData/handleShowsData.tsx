import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { throwErrorNoData } from 'Components/Firebase/Errors'
import {
  EpisodesFromUserDatabase,
  ShowInfoFromUserDatabase,
  SingleEpisodeFromUserDatabase,
} from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { EpisodesStoreState } from '../../@Types'
import { addNewShow, changeShow, changeShowEpisodes, selectShow } from '../../userShowsSliceRed'
import { fetchEpisodesFullData } from '../../FirebaseHelpers/FetchData/fetchEpisodesFullData'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import { episodesToOneArray } from '../../Utils/episodesOneArrayModifiers'
import { updateIsEpisodesWatched } from '../../Utils'

export const handleNewShow =
  (showData: ShowInfoFromUserDatabase, firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUserUid = getAuthUidFromState(getState())
    const shouldFetchEpisodes = showData.database !== 'notWatchingShows'

    try {
      let episodesRawData: EpisodesStoreState[] = []
      const showInfoFireSnapshot = await firebase.showInfoFireDatabase(showData.id).once('value')
      if (showInfoFireSnapshot.val() === null) {
        throwErrorNoData()
      }

      if (shouldFetchEpisodes) {
        episodesRawData = await fetchEpisodesFullData({ authUserUid, showKey: showData.id, firebase })
      }

      const [episodesFinalData, allReleasedEpisodesWatched] = updateIsEpisodesWatched(episodesRawData)
      const show = {
        ...showInfoFireSnapshot.val()!,
        ...showData,
        allReleasedEpisodesWatched,
        episodes: episodesFinalData,
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
      console.log('already fetched')
      console.log({ showData })
      const show = { info: { ...showFromStore, ...showData } }
      dispatch(changeShow(show))
      return
    }

    try {
      const episodesRawData = await fetchEpisodesFullData({ authUserUid, showKey: showData.id, firebase })
      const [episodesFinalData, allReleasedEpisodesWatched] = updateIsEpisodesWatched(episodesRawData)

      console.log('handleChangeShow after AWAIT')

      const show = {
        info: { ...showFromStore, ...showData, allReleasedEpisodesWatched, episodesFetched: true },
        episodes: episodesFinalData,
      }
      dispatch(changeShow(show))
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }

export const testThunk =
  ({ showId, episodes }: any): AppThunk<Promise<any>> =>
  async (dispatch, getState) => {
    const [episodesFinalData, allReleasedEpisodesWatched] = updateIsEpisodesWatched(episodes)

    dispatch(changeShowEpisodes({ showId, episodes: episodesFinalData, allReleasedEpisodesWatched }))
    return 'opa'
  }

export const handleChangeEpisodes =
  (showId: number, episodes: EpisodesFromUserDatabase['episodes'], firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())

    console.time('test')
    const isAnyEpisodeNotWatched = episodesToOneArray<SingleEpisodeFromUserDatabase>(episodes).some(
      (episode) => !episode.watched,
    )
    console.timeEnd('test')

    firebase.userShow({ authUid, key: showId }).update({ allEpisodesWatched: !isAnyEpisodeNotWatched })
    return dispatch(testThunk({ showId, episodes })).then((res) => console.log({ res }))
  }

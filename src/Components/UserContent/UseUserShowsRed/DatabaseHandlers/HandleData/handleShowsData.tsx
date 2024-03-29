import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { throwErrorNoData } from 'Components/Firebase/Errors'
import {
  EpisodesFromUserDatabase,
  SeasonFromUserDatabase,
  ShowInfoFromUserDatabase,
  SingleEpisodeFromUserDatabase,
} from 'Components/Firebase/@TypesFirebase'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { EpisodesStoreState } from '../../@Types'
import { addNewShow, changeShow, changeShowEpisodes, selectShow } from '../../userShowsSliceRed'
import { fetchEpisodesFullData } from '../../FirebaseHelpers/FetchData/fetchEpisodesFullData'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import { validEpisodesToOneArray } from '../../Utils/episodesOneArrayModifiers'
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

      const [episodesFinalData, allReleasedEpisodesWatched] =
        updateIsEpisodesWatched<EpisodesStoreState>(episodesRawData)
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

    if (!showFromStore) return
    if (showFromStore.episodesFetched) {
      const show = { info: { ...showFromStore, ...showData } }
      dispatch(changeShow(show))
      return
    }

    try {
      const episodesRawData = await fetchEpisodesFullData({ authUserUid, showKey: showData.id, firebase })
      const [episodesFinalData, allReleasedEpisodesWatched] =
        updateIsEpisodesWatched<EpisodesStoreState>(episodesRawData)

      const show = {
        info: { ...showFromStore, ...showData, allReleasedEpisodesWatched, episodesFetched: true },
        episodes: episodesFinalData,
      }
      dispatch(changeShow(show))
    } catch (err) {
      dispatch(handleShowsError(err))
    }
  }

export const handleChangeEpisodes =
  (showId: number, episodes: EpisodesFromUserDatabase['episodes'], firebase: FirebaseInterface): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const isAnyEpisodeNotWatched = validEpisodesToOneArray<SingleEpisodeFromUserDatabase>(episodes).some(
      (episode) => !episode.watched,
    )
    const [episodesFinalData, allReleasedEpisodesWatched] = updateIsEpisodesWatched<SeasonFromUserDatabase>(episodes)

    firebase.userShow({ authUid, key: showId }).update({ allEpisodesWatched: !isAnyEpisodeNotWatched })
    return dispatch(changeShowEpisodes({ showId, episodes: episodesFinalData, allReleasedEpisodesWatched }))
  }

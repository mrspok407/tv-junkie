import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postCheckAllReleasedEpisodesScheme } from 'Components/Firebase/FirebasePostSchemes/Post/ContentSchemes'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { releasedEpisodesToOneArray } from 'Components/UserContent/UseUserShowsRed/Utils/episodesOneArrayModifiers'
import { SingleEpisodeStoreState } from '../../@Types'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import { selectShowEpisodes, selectSingleEpisode, selectSingleSeason } from '../../userShowsSliceRed'

type PostCheckAllReleasedEpisodesT = {
  showId: number
  firebase: FirebaseInterface
  seasonNumber?: number
}

export const postCheckReleasedEpisodes =
  ({ showId, seasonNumber, firebase }: PostCheckAllReleasedEpisodesT): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const episodesFromStore = seasonNumber
      ? [selectSingleSeason(getState(), showId, seasonNumber)]
      : selectShowEpisodes(getState(), showId)
    const releasedEpisodes = releasedEpisodesToOneArray<SingleEpisodeStoreState>(episodesFromStore)
    const isAnyEpisodeNotWatched = releasedEpisodes.some((episode) => !episode.watched)

    try {
      const updateData = postCheckAllReleasedEpisodesScheme({
        showId,
        authUid,
        releasedEpisodes,
        isWatched: isAnyEpisodeNotWatched,
      })

      return firebase.rootRef().update(updateData)
    } catch (error) {
      dispatch(handleShowsError(error))
    }
  }

type PostCheckSingleEpisodeT = {
  showId: number
  seasonNumber: number
  episodeNumber: number
  firebase: FirebaseInterface
}

export const postCheckSingleEpisode =
  ({ showId, seasonNumber, episodeNumber, firebase }: PostCheckSingleEpisodeT): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const episodeFromStore = selectSingleEpisode(getState(), showId, seasonNumber, episodeNumber)

    try {
      firebase.userShowSingleEpisode({ authUid, key: showId, seasonNumber, episodeNumber }).update({
        watched: !episodeFromStore?.watched,
      })
    } catch (error) {
      dispatch(handleShowsError(error))
    }
  }

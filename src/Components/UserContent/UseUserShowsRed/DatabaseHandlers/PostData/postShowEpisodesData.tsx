import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { postCheckAllReleasedEpisodesScheme } from 'Components/Firebase/FirebasePostSchemes/Post/ContentSchemes'
import { getAuthUidFromState } from 'Components/UserAuth/Session/Authentication/Helpers'
import { releasedEpisodesToOneArray } from 'Utils'
import { SingleEpisodeStoreState } from '../../@Types'
import { handleShowsError } from '../../ErrorHandlers/handleShowsError'
import { selectShowEpisodes } from '../../userShowsSliceRed'

type Props = {
  showId: number
  firebase: FirebaseInterface
}

export const postCheckAllReleasedEpisodes =
  ({ showId, firebase }: Props): AppThunk =>
  async (dispatch, getState) => {
    const authUid = getAuthUidFromState(getState())
    const episodesFromStore = selectShowEpisodes(getState(), showId)
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

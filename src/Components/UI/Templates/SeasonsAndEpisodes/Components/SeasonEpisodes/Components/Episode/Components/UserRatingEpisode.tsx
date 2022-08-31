import { useAppDispatch, useAppSelector } from 'app/hooks'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import UserRating from 'Components/UI/UserRating/UserRating'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import { selectShowStatus, selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useUnmountRef from 'Utils/Hooks/UseUnmountRef'

type Props = {
  showRating: boolean
  showId: number
  episodeData: SingleEpisodeFromFireDatabase
}

const UserRatingEpisode: React.FC<Props> = ({ showId, episodeData, showRating }) => {
  const { firebase, authUser } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const isUnmountedRef = useUnmountRef()

  const showStatus = useAppSelector((state) => selectShowStatus(state, showId))
  const currentRating = useAppSelector(
    (state) =>
      selectSingleEpisode(state, showId, episodeData.originalSeasonIndex, episodeData.originalEpisodeIndex)
        ?.userRating ?? 0,
  )

  const handlePostData = (rating: number) => {
    try {
      firebase
        .userShowSingleEpisode({
          authUid: authUser?.uid,
          key: showId,
          seasonNumber: episodeData.originalSeasonIndex,
          episodeNumber: episodeData.originalEpisodeIndex,
        })
        .update({ userRating: rating, watched: true })
    } catch (error) {
      if (isUnmountedRef.current) return
      dispatch(handleShowsError(error))
    }
  }

  const disableRating = showStatus === 'notWatchingShows'

  if (!showRating || !authUser?.uid) return null

  return <UserRating currentRating={currentRating} isDisabled={disableRating} onClick={handlePostData} />
}

export default UserRatingEpisode

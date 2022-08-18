import { useAppDispatch, useAppSelector } from 'app/hooks'
import UserRating from 'Components/UI/UserRating/UserRating'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import { selectShowStatus, selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useUnmountRef from 'Utils/Hooks/UseUnmountRef'

type Props = {
  showRating: boolean
  showId: number
  seasonNumber: number
  episodeNumber: number
  isToWatchPage: boolean
}

const UserRatingEpisode: React.FC<Props> = ({
  showId,
  seasonNumber,
  episodeNumber,
  showRating,
  isToWatchPage = false,
}) => {
  const { firebase, authUser } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const isUnmountedRef = useUnmountRef()

  const showStatus = useAppSelector((state) => selectShowStatus(state, showId))
  const currentRating = useAppSelector(
    (state) => selectSingleEpisode(state, showId, seasonNumber, episodeNumber)?.userRating ?? 0,
  )

  const handlePostData = (rating: number) => {
    console.log({ rating })
    try {
      firebase
        .userShowSingleEpisode({ authUid: authUser?.uid, key: showId, seasonNumber, episodeNumber })
        .update({ userRating: rating, watched: true })
    } catch (error) {
      if (isUnmountedRef.current) return
      dispatch(handleShowsError(error))
    }
  }

  const disableRating = showStatus === 'notWatchingShows'

  if (!showRating || !authUser?.uid) return null

  return (
    <UserRating
      currentRating={!isToWatchPage ? currentRating : 0}
      isDisabled={disableRating}
      onClick={handlePostData}
    />
  )
}

export default UserRatingEpisode

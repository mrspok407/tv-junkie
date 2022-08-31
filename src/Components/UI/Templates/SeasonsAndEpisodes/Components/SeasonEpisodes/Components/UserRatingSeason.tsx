import React from 'react'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import UserRating from 'Components/UI/UserRating/UserRating'
import { selectShowStatus, selectSingleSeason } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import useUnmountRef from 'Utils/Hooks/UseUnmountRef'

type Props = {
  showRating: boolean
  showId: number
  seasonNumber: number
}

const UserRatingSeason: React.FC<Props> = ({ showId, seasonNumber, showRating }) => {
  const { firebase, authUser } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const seasonIndex = seasonNumber - 1

  const isUnmountedRef = useUnmountRef()

  const showStatus = useAppSelector((state) => selectShowStatus(state, showId))
  const currentRating = useAppSelector((state) => selectSingleSeason(state, showId, seasonIndex)?.userRating) ?? 0

  const handlePostData = (rating: number) => {
    try {
      firebase
        .userShowSingleSeason({ authUid: authUser?.uid, key: showId, seasonNumber: seasonIndex })
        .update({ userRating: rating })
    } catch (error) {
      if (isUnmountedRef.current) return
      dispatch(handleShowsError(error))
    }
  }

  const disableRating = showStatus === 'notWatchingShows'

  if (!showRating || !authUser?.uid) return null

  return <UserRating currentRating={currentRating} isDisabled={disableRating} onClick={handlePostData} />
}

export default UserRatingSeason

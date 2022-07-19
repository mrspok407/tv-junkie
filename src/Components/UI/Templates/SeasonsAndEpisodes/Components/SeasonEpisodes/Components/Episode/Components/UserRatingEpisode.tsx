import { useAppSelector } from 'app/hooks'
import UserRating from 'Components/UI/UserRating/UserRating'
import { selectShow } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  showRating: boolean
  showId: number
  seasonNum: number
  episodeNum: number
}

const UserRatingEpisode: React.FC<Props> = ({ showId, seasonNum, episodeNum, showRating }) => {
  const { authUser } = useFrequentVariables()
  const showFromStore = useAppSelector((state) => selectShow(state, showId))

  if (!showRating || !authUser?.uid) return null

  return (
    <UserRating
      id={showId}
      firebaseRef="userShowSingleEpisode"
      seasonNum={seasonNum}
      episodeNum={episodeNum}
      episodeRating
      disableRating={!!(showFromStore?.database === 'notWatchingShows')}
    />
  )
}

export default UserRatingEpisode

import React from 'react'
import { useAppSelector } from 'app/hooks'
import UserRating from 'Components/UI/UserRating/UserRating'
import { selectShow } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  showRating: boolean
  showId: number
  seasonNum: number
}

const UserRatingSeason: React.FC<Props> = ({ showId, seasonNum, showRating }) => {
  const { authUser } = useFrequentVariables()
  const showFromStore = useAppSelector((state) => selectShow(state, showId))

  if (!showRating || !authUser?.uid) return null

  return (
    <UserRating
      id={showId}
      firebaseRef="userShowSeason"
      seasonNum={seasonNum}
      disableRating={!!(showFromStore?.database === 'notWatchingShows')}
    />
  )
}

export default UserRatingSeason

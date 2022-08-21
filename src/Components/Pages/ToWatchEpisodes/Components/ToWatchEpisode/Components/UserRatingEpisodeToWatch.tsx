import { useAppDispatch, useAppSelector } from 'app/hooks'
import UserRating from 'Components/UI/UserRating/UserRating'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import { selectShowStatus, selectSingleEpisode } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useUnmountRef from 'Utils/Hooks/UseUnmountRef'

type Props = {
  handleEpisodeCheck: (rating?: number) => void
}

const UserRatingEpisodeToWatch: React.FC<Props> = ({ handleEpisodeCheck }) => {
  return <UserRating isDisabled={false} currentRating={0} onClick={handleEpisodeCheck} />
}

export default UserRatingEpisodeToWatch

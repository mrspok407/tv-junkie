import UserRating from 'Components/UI/UserRating/UserRating'
import React from 'react'

type Props = {
  handleEpisodeCheck: (rating?: number) => void
}

const UserRatingEpisodeToWatch: React.FC<Props> = ({ handleEpisodeCheck }) => {
  return <UserRating isDisabled={false} currentRating={0} onClick={handleEpisodeCheck} />
}

export default UserRatingEpisodeToWatch

import React from 'react'
import UserRating from 'Components/UI/UserRating/UserRating'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useDisableWarning from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Hooks/UseDisableWarning'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'

type Props = {
  showId: number
}

const UserRatingShow: React.FC<Props> = ({ showId }) => {
  const { authUser } = useFrequentVariables()
  const [showDisableWarning, handleDisableWarning, fadeOutStart, ref] = useDisableWarning()

  return (
    <>
      <div
        className="detailes-page__info-value detailes-page__info-value--rating"
        ref={ref}
        onClick={(e) => {
          if (authUser?.uid) return
          handleDisableWarning(e)
        }}
      >
        <UserRating id={showId} firebaseRef="userShow" />
        {showDisableWarning && <DisableWarning fadeOutStart={fadeOutStart} />}
      </div>
    </>
  )
}

export default UserRatingShow

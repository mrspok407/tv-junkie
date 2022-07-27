import React from 'react'
import UserRating from 'Components/UI/UserRating/UserRating'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useDisableWarning from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Hooks/UseDisableWarning'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'
import { useAppSelector } from 'app/hooks'
import { selectShow } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { selectMovie } from 'Components/UserContent/UseUserMoviesRed/userMoviesSliceRed'

type Props = {
  contentId: number
  isMediaTypeTV: boolean
}

const UserRatingWrapper: React.FC<Props> = ({ contentId, isMediaTypeTV }) => {
  const { authUser } = useFrequentVariables()
  const [showDisableWarning, handleDisableWarning, fadeOutStart, ref] = useDisableWarning()

  const contentInStore = useAppSelector((state) => {
    if (isMediaTypeTV) {
      return selectShow(state, contentId)
    } else {
      return selectMovie(state, contentId)
    }
  })

  console.log({ contentInStore: !!contentInStore })

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
        <UserRating
          id={contentId}
          firebaseRef={isMediaTypeTV ? 'userShow' : 'userMovie'}
          disableRating={!contentInStore}
        />
        {showDisableWarning && <DisableWarning fadeOutStart={fadeOutStart} />}
      </div>
    </>
  )
}

export default UserRatingWrapper

import React from 'react'
import UserRating from 'Components/UI/UserRating/UserRating'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useDisableWarning from 'Components/UI/Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/Components/Episode/Hooks/UseDisableWarning'
import DisableWarning from 'Components/UI/DisabledWarning/DisabledWarning'
import { useAppSelector, useAppDispatch } from 'app/hooks'
import { selectShow, selectShowRating } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { selectMovie, selectMovieRating } from 'Components/UserContent/UseUserMoviesRed/userMoviesSliceRed'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import useUnmountRef from 'Utils/Hooks/UseUnmountRef'

type Props = {
  contentId: number
  isMediaTypeTV: boolean
}

const UserRatingWrapper: React.FC<Props> = ({ contentId, isMediaTypeTV }) => {
  const { firebase, authUser } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const [showDisableWarning, handleDisableWarning, fadeOutStart, ref] = useDisableWarning()
  const isUnmountedRef = useUnmountRef()

  const contentExistInStore = useAppSelector((state) =>
    isMediaTypeTV ? selectShow(state, contentId)?.id : selectMovie(state, contentId)?.id,
  )
  const currentRating =
    useAppSelector((state) =>
      isMediaTypeTV ? selectShowRating(state, contentId) : selectMovieRating(state, contentId),
    ) ?? 0

  const handlePostData = (rating: number) => {
    const updateData = { userRating: rating }
    try {
      if (isMediaTypeTV) {
        firebase.userShow({ authUid: authUser?.uid, key: contentId }).update(updateData)
      } else {
        firebase.userMovie({ authUid: authUser?.uid, key: contentId }).update(updateData)
      }
    } catch (error) {
      if (isUnmountedRef.current) return
      dispatch(handleShowsError(error))
    }
  }

  const disableRating = !contentExistInStore
  return (
    <>
      <div
        className="details-page__info-value details-page__info-value--rating"
        ref={ref}
        onClick={(e) => {
          if (authUser?.uid) return
          handleDisableWarning(e)
        }}
      >
        <UserRating currentRating={currentRating} isDisabled={disableRating} onClick={handlePostData} />
        {showDisableWarning && <DisableWarning fadeOutStart={fadeOutStart} />}
      </div>
    </>
  )
}

export default UserRatingWrapper

import { useAppDispatch } from 'app/hooks'
import { handleShowsError } from 'Components/UserContent/UseUserShowsRed/ErrorHandlers/handleShowsError'
import React, { useState, useEffect } from 'react'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  showId: number
}

const UsersWatching: React.FC<Props> = ({ showId }) => {
  const { authUser, firebase } = useFrequentVariables()
  const dispatch = useAppDispatch()

  const [usersWatchingShowAmount, setUsersWatchingShowAmount] = useState<number | null>(null)

  useEffect(() => {
    if (!authUser.uid) return
    const getUsersWatching = async () => {
      try {
        const usersWatchingShowListSnapshot = await firebase.usersWatchingShowList(showId).once('value')
        setUsersWatchingShowAmount(usersWatchingShowListSnapshot.numChildren())
      } catch (error) {
        dispatch(handleShowsError(error))
      }
    }
    getUsersWatching()
  }, [showId, dispatch, firebase, authUser])

  if (![process.env.REACT_APP_TEST_EMAIL, process.env.REACT_APP_ADMIN_EMAIL].includes(authUser?.email)) {
    return null
  }

  return (
    <div className="details-page__info-row">
      <div className="details-page__info-option">Users watching</div>
      <div className="details-page__info-value">{usersWatchingShowAmount}</div>
    </div>
  )
}

export default UsersWatching

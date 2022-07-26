import React, { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import { SingleEpisodeFromFireDatabase } from 'Components/Firebase/@TypesFirebase'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import { HandleFadeOutInterface } from '../Templates/SeasonsAndEpisodes/Components/SeasonEpisodes/SeasonEpisodes'
import './UserRating.scss'

const STAR_AMOUNT = 5

type Props = {
  id: number
  firebaseRef: string
  seasonNum?: number
  episodeNum?: number
  episodeId?: number
  episodeRating?: boolean
  handleFadeOut?: ({ episodeId, episodeIndex, seasonNum, rating }: HandleFadeOutInterface) => void
  parentComponent?: string
  disableRating?: boolean
  userRatingData?: number | string
}

const UserRating: React.FC<Props> = ({
  id,
  firebaseRef,
  seasonNum,
  episodeNum = 0,
  episodeId = 0,
  episodeRating,
  parentComponent,
  disableRating,
  userRatingData,
  handleFadeOut = () => {},
}) => {
  const { firebase, authUser } = useFrequentVariables()

  const [userRating, setUserRating] = useState(userRatingData || 0)
  const userRatingRef = useRef<HTMLDivElement>(null)

  const getRating = useCallback(() => {
    if (firebase.auth.currentUser === null || parentComponent === 'toWatchPage' || firebaseRef === '') return

    firebase[firebaseRef]({
      authUid: firebase.auth.currentUser.uid,
      key: Number(id),
      seasonNum,
      episodeNum,
    }).once('value', (snapshot: { val: () => { userRating: number } }) => {
      if (snapshot.val() === null) return
      setUserRating(snapshot.val().userRating)
    })
  }, [firebase, firebaseRef, episodeNum, id, seasonNum, parentComponent])

  useEffect(() => {
    getRating()
  }, [getRating])

  const onMouseMoveHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!authUser?.uid) return
    const target = e.target as HTMLButtonElement
    const buttonsNodeList = (target.parentElement as HTMLElement).getElementsByClassName('user-rating__button')
    const currentRating = Number((e.target as HTMLButtonElement).dataset.rating)

    Array.from(buttonsNodeList).forEach((star, index) => {
      if (index + 1 <= currentRating) {
        star.classList.add('user-rating__button-hovered')
      }
      if (index + 1 > currentRating) {
        star.classList.remove('user-rating__button-rated')
      }
    })
  }

  const onMouseLeaveHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!authUser?.uid) return
    const target = e.target as HTMLButtonElement
    const buttonsNodeList = (target.parentElement as HTMLElement).getElementsByClassName('user-rating__button')

    Array.from(buttonsNodeList).forEach((star, index) => {
      star.classList.remove('user-rating__button-hovered')

      if (index + 1 <= userRating) {
        star.classList.add('user-rating__button-rated')
      }
    })
  }

  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!authUser?.uid) return
    const rating = Number((e.target as HTMLButtonElement).dataset.rating)

    console.log(firebaseRef)

    if (parentComponent === 'toWatchPage') {
      if (!seasonNum) return
      handleFadeOut({ episodeId, episodeIndex: episodeNum, seasonNum, rating })
    } else {
      firebase[firebaseRef]({
        authUid: authUser.uid,
        key: Number(id),
        seasonNum,
        episodeNum,
      }).once('value', (snapshot: { val: () => SingleEpisodeFromFireDatabase }) => {
        if (snapshot.val() === null) return

        setUserRating(rating)

        firebase[firebaseRef]({
          authUid: authUser.uid,
          key: Number(id),
          seasonNum,
          episodeNum,
        }).update({
          userRating: rating,
          finished: firebaseRef === 'userMovie' ? true : null,
          watched: parentComponent === 'toWatchPage' ? snapshot.val().watched : episodeRating ? true : null,
        })
      })
    }
  }

  const ratingDisabled = !authUser?.uid || disableRating

  return (
    <div
      ref={userRatingRef}
      className={classNames('user-rating', {
        'user-rating--user-profile': firebaseRef === '',
      })}
    >
      {[...Array(STAR_AMOUNT).keys()].map((n) => (
        <button
          key={n}
          data-rating={n + 1}
          type="button"
          className={classNames('user-rating__button', {
            'user-rating__button-rated': n + 1 <= userRating,
            'user-rating__button--disabled': ratingDisabled,
          })}
          onMouseMove={!ratingDisabled ? onMouseMoveHandler : undefined}
          onMouseLeave={!ratingDisabled ? onMouseLeaveHandler : undefined}
          onClick={!ratingDisabled ? onClickHandler : undefined}
        />
      ))}
    </div>
  )
}

export default UserRating

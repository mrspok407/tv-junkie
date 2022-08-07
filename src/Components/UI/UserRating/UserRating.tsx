import React, { useRef } from 'react'
import classNames from 'classnames'
import './UserRating.scss'

const STAR_AMOUNT_DEFAULT = 5

type Props = {
  currentRating: number
  isDisabled: boolean
  isUserProfile?: boolean
  starAmount?: number
  onClick: (rating: number) => void
}

const UserRating: React.FC<Props> = ({
  currentRating,
  isDisabled,
  isUserProfile = false,
  starAmount = STAR_AMOUNT_DEFAULT,
  onClick,
}) => {
  const userRatingRef = useRef<HTMLDivElement>(null)

  const onMouseMoveHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    const target = e.target as HTMLButtonElement
    const buttonsNodeList = (target.parentElement as HTMLElement).getElementsByClassName('user-rating__button')

    Array.from(buttonsNodeList).forEach((star, index) => {
      star.classList.remove('user-rating__button-hovered')

      if (index + 1 <= currentRating) {
        star.classList.add('user-rating__button-rated')
      }
    })
  }

  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rating = Number((e.target as HTMLButtonElement).dataset.rating)
    onClick(rating)
  }

  return (
    <div
      ref={userRatingRef}
      className={classNames('user-rating', {
        'user-rating--user-profile': isUserProfile,
      })}
    >
      {[...Array(starAmount).keys()].map((n) => (
        <button
          key={n}
          data-rating={n + 1}
          type="button"
          className={classNames('user-rating__button', {
            'user-rating__button-rated': n + 1 <= currentRating,
            'user-rating__button--disabled': isDisabled,
          })}
          onMouseMove={!isDisabled ? onMouseMoveHandler : undefined}
          onMouseLeave={!isDisabled ? onMouseLeaveHandler : undefined}
          onClick={!isDisabled ? onClickHandler : undefined}
        />
      ))}
    </div>
  )
}

export default UserRating

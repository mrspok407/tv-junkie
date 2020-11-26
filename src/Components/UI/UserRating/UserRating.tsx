import React, { useCallback, useContext, useEffect, useRef, useState } from "react"
import classNames from "classnames"
import { Link } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"
import { FirebaseContext } from "Components/Firebase"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import { SingleEpisodeInterface } from "Components/UserContent/UseUserShows/UseUserShows"
import "./UserRating.scss"

const STAR_AMOUNT = 5

type Props = {
  id: number
  firebaseRef: string
  seasonNum?: number
  episodeNum?: number
  episodeId?: number
  episodeRating?: number
  handleFadeOut?: (episodeId: number, episodeIndex: number) => void
  toWatchPage?: boolean
  showDatabase?: string | null
  disableRating?: boolean
  showRating?: boolean
  mediaType?: string
}

const UserRating: React.FC<Props> = ({
  id,
  firebaseRef,
  seasonNum,
  episodeNum = 0,
  episodeId = 0,
  episodeRating,
  showDatabase,
  toWatchPage,
  disableRating,
  showRating,
  mediaType,
  handleFadeOut = () => {}
}) => {
  const [userRating, setUserRating] = useState(0)
  const [nonAuthWarning, setNonAuthWarning] = useState(false)
  const userRatingRef = useRef<HTMLDivElement>(null!)

  const firebase = useContext(FirebaseContext)
  const authUser = useAuthUser()

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, [])

  const handleClickOutside = (e: CustomEvent) => {
    if (userRatingRef.current && !userRatingRef.current.contains(e.target as Node)) {
      setNonAuthWarning(false)
    }
  }

  const getRating = useCallback(() => {
    if (firebase.auth.currentUser === null || toWatchPage) return

    firebase[firebaseRef]({
      uid: firebase.auth.currentUser.uid,
      key: Number(id),
      seasonNum: seasonNum,
      episodeNum: episodeNum
    }).once("value", (snapshot: { val: () => { userRating: number } }) => {
      if (snapshot.val() === null) return
      setUserRating(snapshot.val().userRating)
    })
  }, [firebase, firebaseRef, episodeNum, id, seasonNum, toWatchPage])

  useEffect(() => {
    getRating()
  }, [getRating])

  const onMouseMoveHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (authUser === null) return
    const target = e.target as HTMLButtonElement
    const buttonsNodeList = (target.parentElement as HTMLElement).getElementsByClassName(
      "user-rating__button"
    )
    const currentRating = Number((e.target as HTMLButtonElement).dataset.rating)

    Array.from(buttonsNodeList).forEach((star, index) => {
      if (index + 1 <= currentRating) {
        star.classList.add("user-rating__button-hovered")
      }
      if (index + 1 > currentRating) {
        star.classList.remove("user-rating__button-rated")
      }
    })
  }

  const onMouseLeaveHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (authUser === null) return
    const target = e.target as HTMLButtonElement
    const buttonsNodeList = (target.parentElement as HTMLElement).getElementsByClassName(
      "user-rating__button"
    )

    Array.from(buttonsNodeList).forEach((star, index) => {
      star.classList.remove("user-rating__button-hovered")

      if (index + 1 <= userRating) {
        star.classList.add("user-rating__button-rated")
      }
    })
  }

  const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (authUser === null) return
    if (toWatchPage) {
      handleFadeOut(episodeId, episodeNum)
    }
    const rating = Number((e.target as HTMLButtonElement).dataset.rating)

    firebase[firebaseRef]({
      uid: authUser.uid,
      key: Number(id),
      seasonNum: seasonNum,
      episodeNum: episodeNum
    }).once("value", (snapshot: { val: () => SingleEpisodeInterface }) => {
      if (snapshot.val() === null) return

      setUserRating(rating)

      firebase[firebaseRef]({
        uid: authUser.uid,
        key: Number(id),
        seasonNum: seasonNum,
        episodeNum: episodeNum
      }).update({
        userRating: rating,
        watched: toWatchPage ? snapshot.val().watched : episodeRating ? true : null
      })
    })
  }

  const ratingDisabled =
    authUser === null || disableRating || (showDatabase === null && showRating && mediaType !== "movie")

  return (
    <div
      ref={userRatingRef}
      className="user-rating"
      onClick={() => {
        if (authUser !== null) return
        setNonAuthWarning(!nonAuthWarning)
      }}
    >
      {[...Array(STAR_AMOUNT).keys()].map((n) => (
        <button
          key={n}
          data-rating={n + 1}
          type="button"
          className={classNames("user-rating__button", {
            "user-rating__button-rated": n + 1 <= userRating,
            "user-rating__button--disabled": ratingDisabled
          })}
          onMouseMove={!ratingDisabled ? onMouseMoveHandler : undefined}
          onMouseLeave={!ratingDisabled ? onMouseLeaveHandler : undefined}
          onClick={!ratingDisabled ? onClickHandler : undefined}
        ></button>
      ))}

      {nonAuthWarning && (
        <div className="user-rating__warning">
          To use full features please <Link to={ROUTES.LOGIN_PAGE}>register</Link>. Your allready selected
          shows will be saved.
        </div>
      )}
    </div>
  )
}

export default UserRating

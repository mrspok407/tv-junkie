import React, { useContext, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import * as ROUTES from "Utils/Constants/routes"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { selectShowDatabase } from "Components/UserContent/UseUserShowsRed/userShowsSliceRed"
import { handleDatabaseChange } from "Components/UserContent/UseUserShowsRed/FirebaseHelpers/PostData"
import { FirebaseContext } from "Components/Firebase"
import { fetchShowEpisodes } from "Components/UserContent/UseUserShowsRed/Middleware"

type Props = {
  id: number
  detailes: ContentDetailes
  mediaType: string
}

const ShowsButtons: React.FC<Props> = ({ id, detailes, mediaType }) => {
  const [disableBtnWarning, setDisableBtnWarning] = useState<string | null>(null)
  const _notAuthButtons = useRef<HTMLDivElement>(null)
  const firebase = useContext(FirebaseContext)
  const context = useContext(AppContext)
  const { authUser } = context

  const dispatch = useAppDispatch()
  const showDatabase = useAppSelector((state) => selectShowDatabase(state, id))

  useEffect(() => {
    if (mediaType !== "show" || !authUser || showDatabase === "notWatchingShows") return
    dispatch(fetchShowEpisodes(Number(id), authUser.uid, firebase))
  }, [id, mediaType, showDatabase, authUser, firebase, dispatch])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClickOutside = (e: CustomEvent) => {
    if (authUser) return
    if (!_notAuthButtons?.current?.contains(e.target as Node)) {
      setDisableBtnWarning(null)
    }
  }

  const showDissableBtnWarning = (btn: string) => {
    if (authUser) return
    setDisableBtnWarning(btn)
  }

  return (
    <div className="buttons__row">
      <div className="buttons__col">
        <button
          className={classNames("button", {
            "button--pressed":
              ["watchingShows", "finishedShows"].includes(showDatabase) ||
              context.userContentLocalStorage.watchingShows.find((item) => item.id === Number(id))
          })}
          type="button"
          onClick={() => {
            if (authUser) {
              dispatch(
                handleDatabaseChange({
                  id,
                  database: "watchingShows",
                  showDetailes: detailes,
                  uid: authUser.uid,
                  firebase
                })
              )
            } else {
              context.userContentLocalStorage.addShowLS({
                id: Number(id),
                data: detailes
              })
            }
          }}
        >
          Watching
        </button>
      </div>

      <div className="buttons__col">
        <button
          className={classNames("button", {
            "button--pressed":
              showDatabase === "notWatchingShows" ||
              (!authUser && !context.userContentLocalStorage.watchingShows.find((item) => item.id === Number(id)))
          })}
          type="button"
          onClick={() => {
            if (authUser) {
              dispatch(
                handleDatabaseChange({
                  id,
                  database: "notWatchingShows",
                  showDetailes: detailes,
                  uid: authUser.uid,
                  firebase
                })
              )
            } else {
              context.userContentLocalStorage.removeShowLS({
                id: Number(id)
              })
            }
          }}
        >
          Not watching
        </button>
      </div>
      <div className="buttons__col-wrapper" ref={_notAuthButtons}>
        <div className="buttons__col">
          <button
            className={classNames("button", {
              "button--pressed": showDatabase === "droppedShows",
              "button--not-logged-in": !authUser
            })}
            type="button"
            onClick={() => {
              if (authUser) {
                dispatch(
                  handleDatabaseChange({
                    id,
                    database: "droppedShows",
                    showDetailes: detailes,
                    uid: authUser.uid,
                    firebase
                  })
                )
              } else {
                showDissableBtnWarning("dropBtn")
              }
            }}
          >
            Drop
          </button>

          {disableBtnWarning === "dropBtn" && (
            <div className="buttons__col-warning">
              To use full features please{" "}
              <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
                register
              </Link>
              . Your allready selected shows will be saved.
            </div>
          )}
        </div>
        <div className="buttons__col">
          <button
            className={classNames("button", {
              "button--pressed": showDatabase === "willWatchShows",
              "button--not-logged-in": !authUser
            })}
            type="button"
            onClick={() => {
              if (authUser) {
                dispatch(
                  handleDatabaseChange({
                    id,
                    database: "willWatchShows",
                    showDetailes: detailes,
                    uid: authUser.uid,
                    firebase
                  })
                )
              } else {
                showDissableBtnWarning("willWatchBtn")
              }
            }}
          >
            Will watch
          </button>
          {disableBtnWarning === "willWatchBtn" && (
            <div className="buttons__col-warning">
              To use full features please{" "}
              <Link className="buttons__col-link" to={ROUTES.LOGIN_PAGE}>
                register
              </Link>
              . Your allready selected shows will be saved.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShowsButtons

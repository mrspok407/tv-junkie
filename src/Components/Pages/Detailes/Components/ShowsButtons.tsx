import React, { useContext, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import * as ROUTES from "Utils/Constants/routes"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"

type Props = {
  id: number
  detailes: ContentDetailes
  changeShowDatabaseOnClient: (database: string) => void
  showDatabaseOnClient: string | null
}

const ShowsButtons: React.FC<Props> = ({
  id,
  detailes,
  changeShowDatabaseOnClient,
  showDatabaseOnClient
}) => {
  const [disableBtnWarning, setDisableBtnWarning] = useState<string | null>(null)
  const _notAuthButtons = useRef<HTMLDivElement>(null)
  const context = useContext(AppContext)
  const authUser = useAuthUser()

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as EventListener)
    return () => {
      document.addEventListener("mousedown", handleClickOutside as EventListener)
    }
  })

  const handleClickOutside = (e: CustomEvent) => {
    if (authUser) return
    if (_notAuthButtons.current && !_notAuthButtons.current.contains(e.target as Node)) {
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
              showDatabaseOnClient === "watchingShows" ||
              showDatabaseOnClient === "finishedShows" ||
              context.userContentLocalStorage.watchingShows.find((item) => item.id === Number(id))
          })}
          type="button"
          onClick={() => {
            if (authUser) {
              changeShowDatabaseOnClient("watchingShows")
              context.userContentHandler.handleShowInDatabases({
                id: Number(id),
                data: detailes,
                database: "watchingShows",
                userShows: context.userContent.userShows
              })
              context.userContent.handleUserShowsOnClient({
                database: "watchingShows",
                id: Number(id)
              })
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
              showDatabaseOnClient === "notWatchingShows" ||
              (!authUser &&
                !context.userContentLocalStorage.watchingShows.find((item) => item.id === Number(id)))
          })}
          type="button"
          onClick={() => {
            if (authUser) {
              changeShowDatabaseOnClient("notWatchingShows")
              context.userContentHandler.handleShowInDatabases({
                id: Number(id),
                data: detailes,
                database: "notWatchingShows",
                userShows: context.userContent.userShows
              })
              context.userContent.handleUserShowsOnClient({
                database: "notWatchingShows",
                id: Number(id)
              })
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
              "button--pressed": showDatabaseOnClient === "droppedShows",
              "button--not-logged-in": !authUser
            })}
            type="button"
            onClick={() => {
              if (authUser) {
                changeShowDatabaseOnClient("droppedShows")
                context.userContentHandler.handleShowInDatabases({
                  id: Number(id),
                  data: detailes,
                  database: "droppedShows",
                  userShows: context.userContent.userShows
                })
                context.userContent.handleUserShowsOnClient({
                  database: "droppedShows",
                  id: Number(id)
                })
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
              "button--pressed": showDatabaseOnClient === "willWatchShows",
              "button--not-logged-in": !authUser
            })}
            type="button"
            onClick={() => {
              if (authUser) {
                changeShowDatabaseOnClient("willWatchShows")
                context.userContentHandler.handleShowInDatabases({
                  id: Number(id),
                  data: detailes,
                  database: "willWatchShows",
                  userShows: context.userContent.userShows
                })
                context.userContent.handleUserShowsOnClient({
                  database: "willWatchShows",
                  id: Number(id)
                })
              } else {
                showDissableBtnWarning("willWatchBtn")
              }
            }}
          >
            Will Watch
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

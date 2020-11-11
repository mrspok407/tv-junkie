import React, { Component } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import * as ROUTES from "Utils/Constants/routes"
import { AppContext } from "Components/AppContext/AppContextHOC"

class ShowsButtons extends Component {
  constructor(props) {
    super(props)

    this.state = {
      disableBtnWarning: null
    }
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  handleClickOutside = (e) => {
    if (this.context.authUser) return
    if (this._notAuthButtons && !this._notAuthButtons.contains(e.target)) {
      this.setState({
        disableBtnWarning: null
      })
    }
  }

  showDissableBtnWarning = (btn) => {
    if (this.context.authUser) return
    this.setState({
      disableBtnWarning: btn
    })
  }

  render() {
    const { id, authUser, detailes } = this.props

    return (
      <div className="buttons__row">
        <div className="buttons__col">
          <button
            className={classNames("button", {
              "button--pressed":
                this.props.showDatabaseOnClient === "watchingShows" ||
                this.props.showDatabaseOnClient === "finishedShows" ||
                this.context.userContentLocalStorage.watchingShows.find((item) => item.id === Number(id))
            })}
            type="button"
            onClick={() => {
              if (authUser) {
                this.props.changeShowDatabaseOnClient("watchingShows")
                this.context.userContentHandler.handleShowInDatabases({
                  id: Number(id),
                  data: detailes,
                  database: "watchingShows",
                  userShows: this.context.userContent.userShows,
                  fullContentPage: true
                })
                this.context.userContent.handleUserShowsOnClient({
                  database: "watchingShows",
                  id: Number(id)
                })
              } else {
                this.context.userContentLocalStorage.addShowLS({
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
                this.props.showDatabaseOnClient === "notWatchingShows" ||
                (!this.context.authUser &&
                  !this.context.userContentLocalStorage.watchingShows.find((item) => item.id === Number(id)))
            })}
            type="button"
            onClick={() => {
              if (authUser) {
                this.props.changeShowDatabaseOnClient("notWatchingShows")
                this.context.userContentHandler.handleShowInDatabases({
                  id: Number(id),
                  data: detailes,
                  database: "notWatchingShows",
                  userShows: this.context.userContent.userShows,
                  fullContentPage: true
                })
                this.context.userContent.handleUserShowsOnClient({
                  database: "notWatchingShows",
                  id: Number(id)
                })
              } else {
                this.context.userContentLocalStorage.removeShowLS({
                  id: Number(id)
                })
              }
            }}
          >
            Not watching
          </button>
        </div>
        <div
          className="buttons__col-wrapper"
          ref={(_notAuthButtons) => {
            this._notAuthButtons = _notAuthButtons
          }}
        >
          <div className="buttons__col">
            <button
              className={classNames("button", {
                "button--pressed": this.props.showDatabaseOnClient === "droppedShows",
                "button--not-logged-in": !authUser
              })}
              type="button"
              onClick={() => {
                if (authUser) {
                  this.props.changeShowDatabaseOnClient("droppedShows")
                  this.context.userContentHandler.handleShowInDatabases({
                    id: Number(id),
                    data: detailes,
                    database: "droppedShows",
                    userShows: this.context.userContent.userShows,
                    fullContentPage: true
                  })
                  this.context.userContent.handleUserShowsOnClient({
                    database: "droppedShows",
                    id: Number(id)
                  })
                } else {
                  this.showDissableBtnWarning("dropBtn")
                }
              }}
            >
              Drop
            </button>

            {this.state.disableBtnWarning === "dropBtn" && (
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
                "button--pressed": this.props.showDatabaseOnClient === "willWatchShows",
                "button--not-logged-in": !authUser
              })}
              type="button"
              onClick={() => {
                if (authUser) {
                  this.props.changeShowDatabaseOnClient("willWatchShows")
                  this.context.userContentHandler.handleShowInDatabases({
                    id: Number(id),
                    data: detailes,
                    database: "willWatchShows",
                    userShows: this.context.userContent.userShows,
                    fullContentPage: true
                  })
                  this.context.userContent.handleUserShowsOnClient({
                    database: "willWatchShows",
                    id: Number(id)
                  })
                } else {
                  this.showDissableBtnWarning("willWatchBtn")
                }
              }}
            >
              Will Watch
            </button>
            {this.state.disableBtnWarning === "willWatchBtn" && (
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
}

export default ShowsButtons
ShowsButtons.contextType = AppContext

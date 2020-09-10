import React, { Component } from "react"
import classNames from "classnames"
// import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { withUserContent } from "Components/UserContent"
import { Link } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"

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

  handleClickOutside = e => {
    if (this.props.authUser) return
    if (this._notAuthButtons && !this._notAuthButtons.contains(e.target)) {
      this.setState({
        disableBtnWarning: null
      })
    }
  }

  showDissableBtnWarning = btn => {
    if (this.props.authUser) return
    this.setState({
      disableBtnWarning: btn
    })
  }

  render() {
    const { id, authUser, infoToPass } = this.props

    console.log(this.props)
    console.log(this.context)

    return (
      <div className="buttons__row">
        <div className="buttons__col">
          <button
            className={classNames("button", {
              "button--pressed":
                this.props.showDatabaseOnClient === "watchingShows" ||
                this.props.showDatabaseOnClient === "finishedShows" ||
                this.context.userContentLocalStorage.watchingShows.find(item => item.id === Number(id))
            })}
            type="button"
            onClick={() => {
              if (authUser) {
                this.props.changeShowDatabaseOnClient("watchingShows")
                this.props.handleShowInDatabases({
                  id: Number(id),
                  data: infoToPass,
                  database: "watchingShows"
                })
              } else {
                this.context.userContentLocalStorage.addShowLS({
                  id: Number(id),
                  data: infoToPass
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
                (!this.props.authUser &&
                  !this.context.userContentLocalStorage.watchingShows.find(item => item.id === Number(id)))
            })}
            type="button"
            onClick={() => {
              if (authUser) {
                this.props.changeShowDatabaseOnClient("notWatchingShows")
                this.props.handleShowInDatabases({
                  id: Number(id),
                  data: infoToPass,
                  database: "notWatchingShows"
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
          ref={_notAuthButtons => {
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
                  this.props.handleShowInDatabases({
                    id: Number(id),
                    data: infoToPass,
                    database: "droppedShows"
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
                  this.props.handleShowInDatabases({
                    id: Number(id),
                    data: infoToPass,
                    database: "willWatchShows"
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

export default withUserContent(ShowsButtons)

// ShowsButtons.contextType = UserContentLocalStorageContext
ShowsButtons.contextType = AppContext

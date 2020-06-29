import React, { Component } from "react"
import classNames from "classnames"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"
import { withUserContent } from "Components/UserContent"

class ShowsButtons extends Component {
  constructor(props) {
    super(props)

    this.state = {
      disableBtnWarning: null,
      showInDatabase: null
    }
  }

  componentDidMount() {
    // this.getShowInDatabase()
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
    console.log(this.props.showInDatabase.database)

    return (
      <div className="buttons__row">
        <div className="buttons__col">
          {this.props.showInDatabase.database === "watchingShows" ? (
            <button
              className="button button--pressed"
              type="button"
              onClick={() => {
                if (this.props.authUser) {
                  this.props.handleShowInDatabases({
                    id: Number(id),
                    data: infoToPass,
                    database: "notWatchingShows",
                    callback: !this.props.showInDatabase.show ? this.props.getShowInDatabase : () => {}
                  })
                } else {
                  this.context.toggleContentLS(Number(id), "watchingShows")
                }
              }}
            >
              Not watching
            </button>
          ) : (
            <button
              className="button"
              type="button"
              onClick={() => {
                if (this.props.authUser) {
                  this.props.handleShowInDatabases({
                    id: Number(id),
                    data: infoToPass,
                    database: "watchingShows",
                    callback: !this.props.showInDatabase.show ? this.props.getShowInDatabase : () => {}
                  })
                } else {
                  this.context.toggleContentLS(Number(id), "watchingShows", infoToPass)
                }
              }}
            >
              Watching
            </button>
          )}
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
                "button--pressed": this.props.showInDatabase.database === "droppedShows",
                "button--not-logged-in": !authUser
              })}
              type="button"
              onClick={() => {
                this.props.handleShowInDatabases({
                  id: Number(id),
                  data: infoToPass,
                  database: "droppedShows",
                  callback: !this.props.showInDatabase.show ? this.props.getShowInDatabase : () => {}
                })
                this.showDissableBtnWarning("dropBtn")
              }}
            >
              Drop
            </button>

            {this.state.disableBtnWarning === "dropBtn" && (
              <div className="buttons__col-warning">
                To use full features please register. Your allready selected shows will be saved.
              </div>
            )}
          </div>
          <div className="buttons__col">
            <button
              className={classNames("button", {
                "button--pressed": this.props.showInDatabase.database === "willWatchShows",
                "button--not-logged-in": !authUser
              })}
              type="button"
              onClick={() => {
                this.props.handleShowInDatabases({
                  id: Number(id),
                  data: infoToPass,
                  database: "willWatchShows",
                  callback: !this.props.showInDatabase.show ? this.props.getShowInDatabase : () => {}
                })
                this.showDissableBtnWarning("willWatchBtn")
              }}
            >
              Will Watch
            </button>
            {this.state.disableBtnWarning === "willWatchBtn" && (
              <div className="buttons__col-warning">
                To use full features please register. Your allready selected shows will be saved.
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default withUserContent(ShowsButtons)

ShowsButtons.contextType = UserContentLocalStorageContext

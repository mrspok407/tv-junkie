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
    this.getShowInDatabase()
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
    this.props.firebase.watchingShows(this.props.authUser.uid).off()
    this.props.firebase.notWatchingShows(this.props.authUser.uid).off()
    this.props.firebase.droppedShows(this.props.authUser.uid).off()
    this.props.firebase.willWatchShows(this.props.authUser.uid).off()
  }

  getShowInDatabase = () => {
    this.props.userContent.subDatabases.forEach(item => {
      this.props.firebase[item](this.props.authUser.uid)
        .orderByChild("id")
        .equalTo(Number(this.props.id))
        .on("value", snapshot => {
          if (snapshot.val() !== null) {
            this.setState({
              showInDatabase: item
            })
          }
        })
    })
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

    return (
      <div className="buttons__row">
        <div className="buttons__col">
          {/* {watchingShows.some(item => item.id === Number(id) && item.userWatching) ? ( */}
          {this.state.showInDatabase === "watchingShows" ? (
            <button
              className="button button--pressed"
              type="button"
              onClick={() => {
                if (this.props.authUser) {
                  this.props.handleShowInDatabases(Number(id), infoToPass, "notWatchingShows")
                  // this.props.removeWatchingShow(Number(id))
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
                  // this.props.addWatchingShow(Number(id), infoToPass)
                  this.props.handleShowInDatabases(Number(id), infoToPass, "watchingShows")
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
                "button--pressed": this.state.showInDatabase === "droppedShows",
                "button--not-logged-in": !authUser
              })}
              type="button"
              onClick={() => {
                this.props.handleShowInDatabases(Number(id), infoToPass, "droppedShows")
                // this.props.addShowToSubDatabase(
                //   Number(id),
                //   infoToPass,
                //   "droppedShows",
                //   this.props.showInDatabase
                // )

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
                "button--pressed": this.state.showInDatabase === "willWatchShows",
                "button--not-logged-in": !authUser
              })}
              type="button"
              onClick={() => {
                this.props.handleShowInDatabases(Number(id), infoToPass, "willWatchShows")
                // this.props.addShowToSubDatabase(
                //   Number(id),
                //   infoToPass,
                //   "willWatchShows",
                //   this.props.showInDatabase
                // )
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

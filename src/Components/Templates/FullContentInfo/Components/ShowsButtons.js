import React, { Component } from "react"
import classNames from "classnames"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

export default class ShowsButtons extends Component {
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
    const { userContent, id, authUser, infoToPass } = this.props
    const watchingShows = this.props.authUser
      ? this.props.userContent.watchingShows.filter(item => item.userWatching && item)
      : this.context.watchingShows
    return (
      <div className="buttons__row">
        <div className="buttons__col">
          {watchingShows.some(item => item.id === Number(id) && item.userWatching) ? (
            <button
              className="button button--pressed"
              type="button"
              onClick={() => {
                if (this.props.authUser) {
                  this.props.removeWatchingShow(Number(id))
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
                  this.props.addWatchingShow(Number(id), infoToPass)
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
                "button--pressed": userContent.droppedShows.some(item => item.id === Number(id)),
                "button--not-logged-in": !authUser
              })}
              type="button"
              onClick={() => {
                this.props.addShowToSubDatabase(Number(id), infoToPass, "droppedShows")

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
                "button--pressed": userContent.willWatchShows.some(item => item.id === Number(id)),
                "button--not-logged-in": !authUser
              })}
              type="button"
              onClick={() => {
                this.props.addShowToSubDatabase(Number(id), infoToPass, "willWatchShows")
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

ShowsButtons.contextType = UserContentLocalStorageContext

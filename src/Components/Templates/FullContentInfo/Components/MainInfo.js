/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from "react"
import ShowsButtons from "./ShowsButtons"
import classNames from "classnames"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"
import { withUserContent } from "Components/UserContent"

class MainInfo extends Component {
  constructor(props) {
    super(props)

    this.state = {
      movieInDatabase: null
    }
  }

  componentDidMount() {
    this.getMovieInDatabase()
  }

  getMovieInDatabase = () => {
    this.props.firebase
      .watchLaterMovies(this.props.authUser.uid)
      .orderByChild("id")
      .equalTo(Number(this.props.id))
      .on("value", snapshot => {
        const movie = snapshot.val()
          ? Object.keys(snapshot.val()).map(key => ({
              ...snapshot.val()[key]
            }))
          : []

        this.setState({
          movieInDatabase: movie[0]
        })
      })
  }

  render() {
    const yearRelease = this.props.releaseDate.slice(0, 4)
    const yearEnded = this.props.mediaType === "show" && this.props.lastAirDate.slice(0, 4)
    const yearRange = this.props.status !== "Ended" ? `${yearRelease} - ...` : `${yearRelease} - ${yearEnded}`

    const formatedBudget =
      this.props.budget !== 0 && this.props.budget !== "-" ? (
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        })
          .format(this.props.budget)
          .slice(0, -3)
          .split(",")
          .join(".")
      ) : (
        <span className="full-detailes__info-no-info">-</span>
      )

    return (
      <div className="full-detailes__info">
        <div className="full-detailes__info-title">
          {this.props.title}
          <span>{this.props.mediaType === "show" && yearRelease !== "-" ? ` (${yearRange})` : ""}</span>
        </div>
        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">Year</div>
          <div className="full-detailes__info-value">
            {yearRelease !== "-" ? (
              `${yearRelease}`
            ) : (
              <span className="full-detailes__info-no-info">{yearRelease}</span>
            )}
          </div>
        </div>
        {this.props.status !== "Released" && (
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">Status</div>
            <div className="full-detailes__info-value">{this.props.status}</div>
          </div>
        )}

        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">Genres</div>
          <div className="full-detailes__info-value">{this.props.genres}</div>
        </div>
        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">Company</div>
          <div className="full-detailes__info-value">
            {this.props.mediaType === "show"
              ? this.props.network
              : this.props.mediaType === "movie" &&
                (this.props.productionCompany !== "-" ? (
                  this.props.productionCompany
                ) : (
                  <span className="full-detailes__info-no-info">-</span>
                ))}
          </div>
        </div>
        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">Rating</div>
          <div className="full-detailes__info-value">
            {this.props.rating !== "-" ? (
              this.props.rating
            ) : (
              <span className="full-detailes__info-no-info">{this.props.rating}</span>
            )}
          </div>
        </div>
        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">Runtime</div>
          <div className="full-detailes__info-value">
            {this.props.runtime !== "-" ? (
              `${this.props.runtime} min`
            ) : (
              <span className="full-detailes__info-no-info">{this.props.runtime}</span>
            )}
          </div>
        </div>
        {this.props.mediaType === "movie" && (
          <>
            <div className="full-detailes__info-row">
              <div className="full-detailes__info-option">Tagline</div>
              <div className="full-detailes__info-value">
                {this.props.tagline !== "-" ? (
                  `${this.props.tagline}`
                ) : (
                  <span className="full-detailes__info-no-info">{this.props.tagline}</span>
                )}
              </div>
            </div>
            <div className="full-detailes__info-row">
              <div className="full-detailes__info-option">Budget</div>
              <div className="full-detailes__info-value">{formatedBudget}</div>
            </div>
            <div className="full-detailes__info-row">
              <div className="full-detailes__info-option">External links</div>
              <div className="full-detailes__info-value">
                <a
                  href={`https://www.imdb.com/title/${this.props.imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="full-detailes__info-imdb"
                />
              </div>
            </div>
          </>
        )}

        <div className="full-detailes__info-row full-detailes__info--button">
          {this.props.mediaType === "show" && (
            <ShowsButtons
              id={this.props.id}
              userContent={this.props.userContent}
              authUser={this.props.authUser}
              addWatchingShow={this.props.addWatchingShow}
              removeWatchingShow={this.props.removeWatchingShow}
              addShowToSubDatabase={this.props.addShowToSubDatabase}
              infoToPass={this.props.infoToPass}
              showInDatabase={this.props.showInDatabase}
              handleShowInDatabases={this.props.handleShowInDatabases}
            />
          )}

          {this.props.mediaType === "movie" && (
            <button
              className={classNames("button", {
                "button--pressed": this.state.movieInDatabase
              })}
              onClick={() => {
                if (this.props.authUser) {
                  this.props.toggleWatchLaterMovie(
                    Number(this.props.id),
                    this.props.infoToPass,
                    this.state.movieInDatabase
                  )
                } else {
                  this.context.toggleContentLS(
                    Number(this.props.id),
                    "watchLaterMovies",
                    this.props.infoToPass
                  )
                }
              }}
              type="button"
            >
              {this.state.movieInDatabase ? "Remove" : "Watch later"}
            </button>
          )}
        </div>
      </div>
    )
  }
}

export default withUserContent(MainInfo)

MainInfo.contextType = UserContentLocalStorageContext

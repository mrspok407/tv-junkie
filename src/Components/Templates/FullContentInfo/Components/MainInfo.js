/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from "react"
import ShowsButtons from "./ShowsButtons"
import classNames from "classnames"
// import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { withUserContent } from "Components/UserContent"
import UserRating from "Components/UserRating/UserRating"

class MainInfo extends Component {
  render() {
    const detailes = this.props.detailes

    const yearRelease = detailes.releaseDate.slice(0, 4)
    const yearEnded = this.props.mediaType === "show" && detailes.lastAirDate.slice(0, 4)
    const yearRange =
      detailes.status === "Ended" || detailes.status === "Canceled"
        ? `${yearRelease} - ${yearEnded}`
        : `${yearRelease} - ...`

    const formatedBudget =
      detailes.budget !== 0 && detailes.budget !== "-" ? (
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        })
          .format(detailes.budget)
          .slice(0, -3)
          .split(",")
          .join(".")
      ) : (
        <span className="full-detailes__info-no-info">-</span>
      )

    return (
      <div className="full-detailes__info">
        <div className="full-detailes__info-title">
          {detailes.title}
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
        {detailes.status !== "Released" && (
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">Status</div>
            <div className="full-detailes__info-value">{detailes.status}</div>
          </div>
        )}

        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">Genres</div>
          <div className="full-detailes__info-value">{detailes.genres}</div>
        </div>
        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">Company</div>
          <div className="full-detailes__info-value">
            {this.props.mediaType === "show"
              ? detailes.network
              : this.props.mediaType === "movie" &&
                (detailes.productionCompany !== "-" ? (
                  detailes.productionCompany
                ) : (
                  <span className="full-detailes__info-no-info">-</span>
                ))}
          </div>
        </div>
        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">User rating</div>
          <div className="full-detailes__info-value">
            {detailes.rating !== "-" ? (
              detailes.rating
            ) : (
              <span className="full-detailes__info-no-info">{detailes.rating}</span>
            )}
          </div>
        </div>
        <div className="full-detailes__info-row">
          <div className="full-detailes__info-option">Runtime</div>
          <div className="full-detailes__info-value">
            {detailes.runtime !== "-" ? (
              `${detailes.runtime} min`
            ) : (
              <span className="full-detailes__info-no-info">{detailes.runtime}</span>
            )}
          </div>
        </div>

        {this.props.mediaType === "show" && (
          <div className="full-detailes__info-row">
            <div className="full-detailes__info-option">My rating</div>
            <div className="full-detailes__info-value">
              <UserRating
                id={this.props.id}
                firebaseRef="userShow"
                showDatabase={this.props.showDatabaseOnClient}
                // showDatabase={this.props.showInDatabase.database}
                showRating={true}
                mediaType={this.props.mediaType}
              />
            </div>
          </div>
        )}

        {this.props.mediaType === "movie" && (
          <>
            <div className="full-detailes__info-row">
              <div className="full-detailes__info-option">Tagline</div>
              <div className="full-detailes__info-value">
                {detailes.tagline !== "-" ? (
                  `${detailes.tagline}`
                ) : (
                  <span className="full-detailes__info-no-info">{detailes.tagline}</span>
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
                  href={`https://www.imdb.com/title/${detailes.imdbId}`}
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
              authUser={this.props.authUser}
              infoToPass={this.props.infoToPass}
              changeShowDatabaseOnClient={this.props.changeShowDatabaseOnClient}
              showDatabaseOnClient={this.props.showDatabaseOnClient}
              showInDatabase={this.props.showInDatabase}
            />
          )}

          {this.props.mediaType === "movie" && (
            <button
              className={classNames("button", {
                "button--pressed":
                  this.props.movieInDatabase ||
                  this.context.userContentLocalStorage.watchLaterMovies.find(
                    item => item.id === Number(this.props.id)
                  )
              })}
              onClick={() => {
                if (this.props.authUser) {
                  this.props.handleMovieInDatabases({
                    id: Number(this.props.id),
                    data: this.props.infoToPass,
                    userDatabase: "watchLaterMovies"
                  })
                } else {
                  this.context.userContentLocalStorage.toggleMovieLS({
                    id: Number(this.props.id),
                    data: this.props.infoToPass
                  })
                }
              }}
              type="button"
            >
              {this.props.movieInDatabase === "watchLaterMovies" ? "Remove" : "Watch later"}
            </button>
          )}
        </div>
      </div>
    )
  }
}

export default withUserContent(MainInfo)

// MainInfo.contextType = UserContentLocalStorageContext
MainInfo.contextType = AppContext

/* eslint-disable jsx-a11y/anchor-has-content */
import React, { Component } from "react"
import ShowsButtons from "./ShowsButtons"
import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { withUserContent } from "Components/UserContent"
import UserRating from "Components/UserRating/UserRating"

class MainInfo extends Component {
  render() {
    const detailes = this.props.detailes
    const isMediaTypeTV = this.props.mediaType === "show"

    const title = isMediaTypeTV ? detailes.name : detailes.title
    const yearRelease = isMediaTypeTV
      ? detailes.first_air_date.slice(0, 4)
      : detailes.release_date.slice(0, 4)
    const yearEnded = isMediaTypeTV && detailes.last_air_date.slice(0, 4)
    const yearRange =
      detailes.status === "Ended" || detailes.status === "Canceled"
        ? `${yearRelease} - ${yearEnded}`
        : `${yearRelease} - ...`
    const runtime = isMediaTypeTV ? detailes.episode_run_time[0] : detailes.runtime

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
        <span className="detailes-page__info-no-info">-</span>
      )

    return (
      <div className="detailes-page__info">
        <div className="detailes-page__info-title">
          {title}
          <span>{isMediaTypeTV && yearRelease !== "-" ? ` (${yearRange})` : ""}</span>
        </div>
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">Year</div>
          <div className="detailes-page__info-value">
            {yearRelease !== "-" ? (
              `${yearRelease}`
            ) : (
              <span className="detailes-page__info-no-info">{yearRelease}</span>
            )}
          </div>
        </div>
        {detailes.status !== "Released" && (
          <div className="detailes-page__info-row">
            <div className="detailes-page__info-option">Status</div>
            <div className="detailes-page__info-value">{detailes.status}</div>
          </div>
        )}

        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">Genres</div>
          <div className="detailes-page__info-value">{detailes.genres}</div>
        </div>
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">Company</div>
          <div className="detailes-page__info-value">
            {isMediaTypeTV ? (
              detailes.network
            ) : detailes.production_companies !== "-" ? (
              detailes.production_companies
            ) : (
              <span className="detailes-page__info-no-info">-</span>
            )}
          </div>
        </div>
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">User rating</div>
          <div className="detailes-page__info-value">
            {detailes.vote_average !== "-" ? (
              detailes.vote_average
            ) : (
              <span className="detailes-page__info-no-info">-</span>
            )}
          </div>
        </div>
        <div className="detailes-page__info-row">
          <div className="detailes-page__info-option">Runtime</div>
          <div className="detailes-page__info-value">
            {runtime !== "-" ? `${runtime} min` : <span className="detailes-page__info-no-info">-</span>}
          </div>
        </div>

        {isMediaTypeTV && (
          <div className="detailes-page__info-row">
            <div className="detailes-page__info-option">My rating</div>
            <div className="detailes-page__info-value">
              <UserRating
                id={this.props.id}
                firebaseRef="userShow"
                showDatabase={this.props.showDatabaseOnClient}
                showRating={true}
                mediaType={this.props.mediaType}
              />
            </div>
          </div>
        )}

        {!isMediaTypeTV && (
          <>
            <div className="detailes-page__info-row">
              <div className="detailes-page__info-option">Tagline</div>
              <div className="detailes-page__info-value">
                {detailes.tagline !== "-" ? (
                  `${detailes.tagline}`
                ) : (
                  <span className="detailes-page__info-no-info">{detailes.tagline}</span>
                )}
              </div>
            </div>
            <div className="detailes-page__info-row">
              <div className="detailes-page__info-option">Budget</div>
              <div className="detailes-page__info-value">{formatedBudget}</div>
            </div>
            <div className="detailes-page__info-row">
              <div className="detailes-page__info-option">External links</div>
              <div className="detailes-page__info-value">
                <a
                  href={`https://www.imdb.com/title/${detailes.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detailes-page__info-imdb"
                />
              </div>
            </div>
          </>
        )}

        <div className="detailes-page__info-row detailes-page__info--button">
          {isMediaTypeTV && (
            <ShowsButtons
              id={this.props.id}
              authUser={this.props.authUser}
              detailes={this.props.detailes}
              changeShowDatabaseOnClient={this.props.changeShowDatabaseOnClient}
              showDatabaseOnClient={this.props.showDatabaseOnClient}
            />
          )}

          {!isMediaTypeTV && (
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
                    data: this.props.detailes,
                    userDatabase: "watchLaterMovies"
                  })
                } else {
                  this.context.userContentLocalStorage.toggleMovieLS({
                    id: Number(this.props.id),
                    data: this.props.detailes
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

MainInfo.contextType = AppContext

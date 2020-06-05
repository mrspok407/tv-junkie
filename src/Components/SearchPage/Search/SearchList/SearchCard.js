import React, { Component } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import { withUserContent } from "Components/UserContent"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

class SearchCard extends Component {
  renderButtons = () => {
    const { id, searchResults, mediaType } = this.props

    const watchLaterMovies = this.props.authUser
      ? this.props.userContent.watchLaterMovies
      : this.context.watchLaterMovies

    const watchingShows = this.props.authUser
      ? this.props.userContent.watchingShows
      : this.context.watchingShows
    return (
      <div className="search-card__buttons">
        {mediaType === "movie" ? (
          <button
            className={classNames("button", {
              "button--pressed": watchLaterMovies.find(item => item.id === id)
            })}
            onClick={() => {
              if (this.props.authUser) {
                this.props.toggleWatchLaterMovie(id, searchResults)
              } else {
                this.context.toggleContentLS(id, "watchLaterMovies", searchResults)
              }

              if (
                !watchLaterMovies.find(item => item.id === id) ||
                this.props.currentlyChosenContent.find(item => item.id === id)
              ) {
                this.props.toggleCurrentlyChosenContent(id, searchResults)
              }
            }}
            type="button"
          >
            {watchLaterMovies.find(item => item.id === id) ? "Remove" : "Watch later"}
          </button>
        ) : (
          <>
            {watchingShows.find(item => item.id === id && item.userWatching === true) ? (
              <button
                className="button button--searchlist button--pressed"
                onClick={() => {
                  if (this.props.authUser) {
                    this.props.removeWatchingShow(id)
                  } else {
                    this.context.toggleContentLS(id, "watchingShows")
                  }
                }}
                type="button"
              >
                Not watching
              </button>
            ) : (
              <button
                className="button button--searchlist"
                onClick={() => {
                  if (this.props.authUser) {
                    this.props.addWatchingShow(id, searchResults)
                  } else {
                    this.context.toggleContentLS(id, "watchingShows", searchResults)
                  }

                  this.props.toggleCurrentlyChosenContent(id, searchResults)
                }}
                type="button"
              >
                Watching
              </button>
            )}
          </>
        )}
      </div>
    )
  }

  render() {
    const {
      movieTitle,
      showTitle,
      personName,
      poster,
      personImage,
      posterBackdrop,
      overview,
      id,
      known_for,
      known_for_department,
      mediaType,
      mediaTypeSearching
    } = this.props

    const type = movieTitle ? "movie" : showTitle && "show"

    return (
      <div
        key={id}
        className={classNames("search-card", {
          "search-card--person": mediaType === "person" || mediaTypeSearching === "person"
        })}
      >
        {mediaType !== "person" && mediaTypeSearching !== "person" ? (
          <>
            <Link className="search-card__image-link" to={`/${type}/${id}`}>
              <div
                className="search-card__image"
                style={
                  poster !== null
                    ? {
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster || posterBackdrop})`
                      }
                    : {
                        backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                      }
                }
              />
            </Link>
            <Link className="search-card__info-link" to={`/${type}/${id}`}>
              <div className="search-card__info">
                <div className="search-card__info-title">{movieTitle || showTitle}</div>

                <div className="search-card__info-description">
                  <div className="search-card__info-description--movie">
                    {overview.length > 150 ? `${overview.substring(0, 150)}...` : overview}
                  </div>
                </div>
              </div>
            </Link>
            {this.renderButtons()}
          </>
        ) : (
          <>
            <div
              className="search-card__image"
              style={
                personImage !== null
                  ? {
                      backgroundImage: `url(https://image.tmdb.org/t/p/w500/${personImage})`
                    }
                  : {
                      backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                    }
              }
            />
            <div className="search-card__info">
              <div className="search-card__info-title">{movieTitle || showTitle || personName}</div>

              <div className="search-card__info-description">
                {mediaTypeSearching !== "person" && (
                  <div className="search-card__info-description--movie">
                    {overview.length > 150 ? `${overview.substring(0, 150)}...` : overview}
                  </div>
                )}

                <div className="search-card__info-description--person">
                  <div className="search-card__info-activity">Main activity: {known_for_department}</div>
                  <div className="search-card__info-person-movies">
                    {known_for.map((item, i) => {
                      const title =
                        item.media_type === "movie"
                          ? item.original_title || "No title"
                          : item.name || "No title"

                      const releaseDate =
                        item.media_type === "movie" ? item.release_date || "" : item.first_air_date || ""

                      return (
                        <span key={item.id}>
                          {title}
                          {known_for.length - 1 !== i
                            ? ` (${releaseDate.slice(0, 4)}), `
                            : ` (${releaseDate.slice(0, 4)})`}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
}

export default withUserContent(SearchCard)

SearchCard.contextType = UserContentLocalStorageContext

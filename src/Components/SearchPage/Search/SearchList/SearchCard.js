import React, { Component } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import { withUserContent } from "Components/UserContent"

class SearchCard extends Component {
  renderButtons = () => {
    const { id, searchResults, mediaType } = this.props
    return (
      <div className="search-card__buttons">
        {mediaType === "movie" ? (
          <button
            className={classNames("button", {
              "button--pressed": this.props.userContent.watchLaterMovies.find(item => item.id === id)
            })}
            onClick={() => {
              this.props.userContent.toggleWatchLaterMovie(id, searchResults)
              if (
                !this.props.userContent.watchLaterMovies.find(item => item.id === id) ||
                this.props.currentlyChosenContent.find(item => item.id === id)
              ) {
                this.props.toggleCurrentlyChosenContent(id, searchResults)
              }
            }}
            type="button"
          >
            {this.props.userContent.watchLaterMovies.find(item => item.id === id) ? "Remove" : "Watch later"}
          </button>
        ) : (
          <>
            {this.props.userContent.watchingShows.find(
              item => item.id === id && item.userWatching === true
            ) ? (
              <button
                className="button button--searchlist button--pressed"
                onClick={() => this.props.userContent.removeWatchingShow(id, searchResults)}
                type="button"
              >
                Not watching
              </button>
            ) : (
              <button
                className="button button--searchlist"
                onClick={() => {
                  this.props.userContent.addWatchingShow(id, searchResults)
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

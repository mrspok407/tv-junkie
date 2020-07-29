import React, { Component } from "react"
import { Link } from "react-router-dom"
import classNames from "classnames"
import { withUserContent } from "Components/UserContent"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"

class SearchCard extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  renderButtons = () => {
    const { searchResults } = this.props

    return (
      <div className="search-card__buttons">
        {this.props.movieTitle ? (
          <button
            className={classNames("button button--search-card", {
              "button--pressed": this.props.contentInDatabase.some(item => item.id === this.props.id)
            })}
            onClick={() => {
              if (this.props.authUser) {
                this.props.toggleWatchLaterMovie({
                  id: this.props.id,
                  data: searchResults,
                  database: "watchLaterMovies"
                })
                this.props.updateContentInDbClient(this.props.id, searchResults)
              } else {
                this.context.toggleContentLS({
                  id: this.props.id,
                  data: searchResults,
                  type: "watchLaterMovies"
                })
              }

              if (
                !this.props.contentInDatabase.some(item => item.id === this.props.id) ||
                this.props.currentlyChosenContent.find(item => item.id === this.props.id)
              ) {
                this.props.toggleCurrentlyChosenContent(this.props.id, searchResults)
              }
            }}
            type="button"
          >
            {this.props.contentInDatabase.some(item => item.id === this.props.id) ? "Remove" : "Watch Later"}
          </button>
        ) : (
          <>
            {this.props.contentInDatabase.some(item => item.id === this.props.id) ? (
              <button
                className="button button--search-card button--pressed"
                onClick={() => {
                  if (this.props.authUser) {
                    this.props.handleShowInDatabases({
                      id: this.props.id,
                      data: searchResults,
                      database: "notWatchingShows"
                    })
                    this.props.updateContentInDbClient(this.props.id, searchResults)
                  } else {
                    this.context.toggleContentLS({
                      id: this.props.id,
                      type: "watchingShows"
                    })
                  }
                  this.props.toggleCurrentlyChosenContent(this.props.id, searchResults)
                }}
                type="button"
                disabled={this.state.loadingDataFromDatabase}
              >
                Not watching
              </button>
            ) : (
              <button
                className="button button--search-card"
                onClick={() => {
                  if (this.props.authUser) {
                    this.props.handleShowInDatabases({
                      id: this.props.id,
                      data: searchResults,
                      database: "watchingShows"
                    })
                    this.props.updateContentInDbClient(this.props.id, searchResults)
                  } else {
                    this.context.toggleContentLS({
                      id: this.props.id,
                      data: searchResults,
                      type: "watchingShows"
                    })
                  }

                  this.props.toggleCurrentlyChosenContent(this.props.id, searchResults)
                }}
                type="button"
                disabled={this.state.loadingDataFromDatabase}
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
      releaseDate,
      voteAverage,
      originCountry,
      originalLanguage,
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
            <Link to={`/${type}/${id}`}>
              <div className="search-card__info">
                <div
                  className="search-card__info-image"
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
                <div className="search-card__info-title">
                  {movieTitle || showTitle}
                  <span className="search-card__info-year">
                    {releaseDate && `(${releaseDate.slice(0, 4)})`}
                  </span>
                  <span className="search-card__info-country">
                    {`${originCountry.length > 0 ? originCountry.join(", ") : ""}`}
                  </span>
                </div>
                <div className="search-card__info-rating">
                  {voteAverage !== 0 && (
                    <>
                      {voteAverage}
                      <span>/10</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          </>
        ) : (
          <>
            <div className="search-card__info">
              <div
                className="search-card__info-image"
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
              <div className="search-card__info-name">{movieTitle || showTitle || personName}</div>
              <div className="search-card__info-activity">Main activity: {known_for_department}</div>
              <div className="search-card__info-known-movies">
                {known_for.map((item, i) => {
                  const mediaType = item.media_type === "movie" ? "movie" : "show"

                  const title =
                    item.media_type === "movie" ? item.original_title || "No title" : item.name || "No title"

                  const releaseDate =
                    item.media_type === "movie" ? item.release_date || "" : item.first_air_date || ""

                  return (
                    <span key={item.id}>
                      <Link className="search-card__info-link" to={`/${mediaType}/${item.id}`}>
                        {title}
                      </Link>

                      {known_for.length - 1 !== i
                        ? ` (${releaseDate.slice(0, 4)}), `
                        : ` (${releaseDate.slice(0, 4)})`}
                    </span>
                  )
                })}
              </div>

              {/* <div className="search-card__info-description">
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
              </div> */}
            </div>
          </>
        )}
      </div>
    )
  }
}

export default withUserContent(SearchCard)

SearchCard.contextType = UserContentLocalStorageContext

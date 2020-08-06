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

  render() {
    const {
      movieTitle,
      showTitle,
      personName,
      releaseDate,
      voteAverage,
      originCountry,
      poster,
      personImage,
      posterBackdrop,
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
          "search-card--person": mediaType === "person" || mediaTypeSearching === "person",
          "search-card__active": this.props.index === this.props.currentListItem
        })}
      >
        {mediaType !== "person" && mediaTypeSearching !== "person" ? (
          <>
            <Link className="search-card__link" to={`/${type}/${id}`} onClick={() => this.props.closeList()}>
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

                <div className="search-card__info-wrapper">
                  {voteAverage !== 0 && (
                    <div className="search-card__info-rating">
                      {
                        <>
                          {voteAverage}
                          <span>/10</span>
                        </>
                      }
                    </div>
                  )}
                  <div className="search-card__info-type">{movieTitle ? "Movie" : "Show"}</div>
                </div>
              </div>
            </Link>
          </>
        ) : (
          <>
            <div className="search-card__info search-card__info--person">
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
            </div>
          </>
        )}
      </div>
    )
  }
}

export default withUserContent(SearchCard)

SearchCard.contextType = UserContentLocalStorageContext

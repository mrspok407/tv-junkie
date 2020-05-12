import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withSelectedContextConsumer } from "../../../SelectedContentContext"

class SearchCard extends Component {
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
      searchResults,
      mediaType,
      mediaTypeSearching
    } = this.props

    const type = movieTitle ? "movie" : showTitle && "show"

    return (
      <div key={id} className="search-card">
        <Link
          className="search-card__image-link"
          to={mediaType !== "person" ? `/${type}/${id}` : ""}
        >
          <div
            className="search-card__image"
            style={
              poster !== null && personImage !== null
                ? {
                    backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster ||
                      posterBackdrop ||
                      personImage})`
                  }
                : {
                    backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                  }
            }
          />
        </Link>
        <Link
          className="search-card__info-link"
          to={mediaType !== "person" ? `/${type}/${id}` : ""}
        >
          <div className="search-card__info">
            <div className="search-card__info-title">{movieTitle || showTitle || personName}</div>

            <div className="search-card__info-description">
              {mediaTypeSearching === "movie" ||
              mediaTypeSearching === "tv" ||
              mediaTypeSearching === "multi" ? (
                <div className="search-card__info-description--movie">
                  {overview.length > 150 ? `${overview.substring(0, 150)}...` : overview}
                </div>
              ) : (
                ""
              )}

              {mediaTypeSearching === "person" || mediaType === "person" ? (
                <div className="search-card__info-description--person">
                  <div className="search-card__info-activity">
                    Main activity: {known_for_department}
                  </div>
                  <div className="search-card__info-person-movies">
                    {known_for.map((item, i) => {
                      const title =
                        item.media_type === "movie"
                          ? item.original_title || "No title"
                          : item.name || "No title"

                      const releaseDate =
                        item.media_type === "movie"
                          ? item.release_date || ""
                          : item.first_air_date || ""

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
              ) : (
                ""
              )}
            </div>
          </div>
        </Link>
        <div
          className={
            mediaTypeSearching === "movie" ||
            mediaTypeSearching === "tv" ||
            (mediaTypeSearching === "multi" && mediaType !== "person")
              ? "search-card__buttons"
              : "search-card__buttons search-card__buttons--person"
          }
        >
          {mediaTypeSearching === "movie" ||
          mediaTypeSearching === "tv" ||
          (mediaTypeSearching === "multi" && mediaType !== "person") ? (
            <div className="search-card__add-movie-btn">
              {this.props.selectedContentState.selectedContent.some(e => e.id === id) ? (
                <button
                  className="button button--searchlist button--pressed"
                  onClick={() => this.props.toggleContent(id, searchResults)}
                  type="button"
                >
                  Remove{" "}
                  {mediaType === "movie" || mediaTypeSearching === "movie" ? "movie" : "show"}
                </button>
              ) : (
                <button
                  className="button button--searchlist"
                  onClick={() => this.props.toggleContent(id, searchResults)}
                  type="button"
                >
                  Add {mediaType === "movie" || mediaTypeSearching === "movie" ? "movie" : "show"}
                </button>
              )}
            </div>
          ) : (
            ""
          )}

          {/* <div className="search-card__full-info-btn">
              <button className="button button--searchlist" type="button">
                Full info
              </button>
            </div> */}
        </div>
      </div>
    )
  }
}

export default withSelectedContextConsumer(SearchCard)

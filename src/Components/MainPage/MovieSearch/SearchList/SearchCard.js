import React, { Component } from "react"

export default class MovieCard extends Component {
  render() {
    const {
      original_title,
      name,
      poster_path,
      profile_path,
      overview,
      id,
      known_for,
      known_for_department,
      searchResults,
      toggleMovie,
      selectedMovies,
      isMovie
    } = this.props
    return (
      <div key={id} className="search-card">
        <div
          className="search-card__image"
          style={
            poster_path !== null && profile_path !== null
              ? {
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster_path ||
                    profile_path})`
                }
              : {
                  backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                }
          }
        />
        <div className="search-card__info">
          <div className="search-card__info-title">
            {original_title || name}
          </div>

          <div className="search-card__info-description">
            {isMovie && (
              <div className="search-card__info-description--movie">
                {overview.length > 150
                  ? `${overview.substring(0, 150)}...`
                  : overview}
              </div>
            )}

            {known_for && (
              <div className="search-card__info-description--person">
                <div className="search-card__info-activity">
                  Main activity: {known_for_department}
                </div>
                <div className="search-card__info-person-movies">
                  {known_for.map((item, i) => {
                    const mediaType = item.media_type

                    const title =
                      mediaType === "movie"
                        ? item.original_title || "No title"
                        : item.name || "No title"

                    const releaseDate =
                      mediaType === "movie"
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
            )}
          </div>

          <div
            className={
              isMovie
                ? "search-card__buttons"
                : "search-card__buttons search-card__buttons--person"
            }
          >
            {isMovie && (
              <div className="search-card__add-movie-btn">
                {selectedMovies.some(e => e.id === id) ? (
                  <button
                    className="button button--movielist button--pressed"
                    onClick={() => toggleMovie(id, searchResults)}
                    type="button"
                  >
                    Remove movie
                  </button>
                ) : (
                  <button
                    className="button button--movielist"
                    onClick={() => toggleMovie(id, searchResults)}
                    type="button"
                  >
                    Add movie
                  </button>
                )}
              </div>
            )}

            <div className="search-card__full-info-btn">
              <button className="button button--movielist" type="button">
                Full info
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

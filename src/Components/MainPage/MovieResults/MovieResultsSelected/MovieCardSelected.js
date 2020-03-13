import React from "react"

export default class MovieCardSelected extends React.PureComponent {
  render() {
    const { title, year, id, poster, overview, toggleMovie } = this.props
    return (
      <div className="movie-results__movie movie-results__movie--selected">
        <div
          className="movie-results__movie--selected-poster"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w200${poster})`
          }}
        />
        <div className="movie-results__movie--selected-info">
          <div className="movie-results__movie--selected-title">
            {title.length > 65 ? `${title.substring(0, 65)}...` : title}
          </div>
          <div className="movie-results__movie--selected-year">{year}</div>
          <div className="movie-results__movie--selected-overview">
            {overview.length > 120
              ? `${overview.substring(0, 120)}...`
              : overview}
          </div>
          <button
            className="button button--selected-movies"
            type="button"
            onClick={() => toggleMovie(id)}
          >
            Remove
          </button>
        </div>
      </div>
    )
  }
}

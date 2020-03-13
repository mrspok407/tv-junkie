import React from "react"
import MovieResultsLoader from "../MovieResultsLoader"
import "./MovieResultsSelected.scss"

export default class MovieResultsSelected extends React.PureComponent {
  render() {
    const {
      searchingRandomMovies,
      selectedMovies,
      toggleMovie,
      clearSelectedMovies
    } = this.props
    return (
      <div className="movie-results movie-results--selected-movies">
        <div className="movie-results__name">
          <h2>Selected Movies</h2>
          <button
            type="button"
            className="button button--clear-movies"
            onClick={() => clearSelectedMovies()}
          >
            Clear Selected
          </button>
        </div>

        {searchingRandomMovies ? (
          <MovieResultsLoader />
        ) : (
          selectedMovies.map(
            ({ title, id, release_date, poster_path, overview }) => (
              <div
                key={id}
                className="movie-results__movie movie-results__movie--selected"
              >
                <div
                  className="movie-results__movie--selected-poster"
                  style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/w200${poster_path})`
                  }}
                />
                <div className="movie-results__movie--selected-info">
                  <div className="movie-results__movie--selected-title">
                    {title.length > 65 ? `${title.substring(0, 65)}...` : title}
                  </div>
                  <div className="movie-results__movie--selected-year">
                    {release_date}
                  </div>
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
          )
        )}
      </div>
    )
  }
}

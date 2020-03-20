import React from "react"
import Loader from "../../Placeholders/Loader"
import MovieCardAdvSearch from "./MovieCardAdvSearch"
import "./MovieResultsAdvSearch.scss"

export default class MovieResultsAdvSearch extends React.PureComponent {
  render() {
    const {
      searchingAdvancedSearch,
      advancedSearchMovies,
      selectedMovies,
      toggleMovie,
      clearAdvSearchMovies
    } = this.props
    return (
      <div className="movie-results movie-results--advanced-search">
        <div className="movie-results__name movie-results__name--advanced">
          <h2>Advanced Searched Movies</h2>
          <button
            type="button"
            className="button button--clear-movies"
            onClick={() => clearAdvSearchMovies()}
          >
            Clear Searched
          </button>
        </div>
        <div className="movie-results--advanced-wrapper">
          {searchingAdvancedSearch ? (
            <Loader className="loader--adv-results" />
          ) : (
            advancedSearchMovies.map(
              (
                {
                  title,
                  id,
                  release_date,
                  vote_average,
                  genre_ids,
                  overview,
                  backdrop_path,
                  vote_count
                },
                index
              ) => (
                <MovieCardAdvSearch
                  key={id}
                  title={title}
                  year={release_date}
                  id={id}
                  voteAverage={vote_average}
                  genreIds={genre_ids}
                  poster={backdrop_path}
                  overview={overview}
                  voteCount={vote_count}
                  index={index}
                  toggleMovie={toggleMovie}
                  selectedMovies={selectedMovies}
                  advancedSearchMovies={advancedSearchMovies}
                />
              )
            )
          )}
        </div>
      </div>
    )
  }
}

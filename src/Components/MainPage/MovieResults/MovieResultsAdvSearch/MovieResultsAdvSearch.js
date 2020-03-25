import React from "react"
import MovieCardAdvSearch from "./MovieCardAdvSearch"
import "./MovieResultsAdvSearch.scss"
import Loader from "../../Placeholders/Loader"

export default class MovieResultsAdvSearch extends React.PureComponent {
  render() {
    return (
      <div className="movie-results movie-results--advanced-search">
        {this.props.advancedSearchMovies.length > 0 && (
          <div className="movie-results__button">
            <button
              type="button"
              className="button button--clear-movies"
              onClick={() => this.props.clearAdvSearchMovies()}
            >
              Clear Searched
            </button>
          </div>
        )}
        <div className="movie-results--advanced-wrapper">
          {this.props.advancedSearchMovies.map(
            (
              {
                title,
                id,
                release_date,
                vote_average,
                genre_ids,
                overview,
                backdrop_path,
                poster_path,
                vote_count
              },
              index
            ) => (
              <MovieCardAdvSearch
                key={id}
                title={title}
                year={release_date}
                id={id}
                testRef={this.props.testRef}
                voteAverage={vote_average}
                genreIds={genre_ids}
                poster={backdrop_path}
                posterBackdrop={poster_path}
                overview={overview}
                voteCount={vote_count}
                index={index}
                toggleMovie={this.props.toggleMovie}
                selectedMovies={this.props.selectedMovies}
                advancedSearchMovies={this.props.advancedSearchMovies}
              />
            )
          )}
        </div>
        {this.props.loadingNewPage && <Loader className="loader--new-page" />}
      </div>
    )
  }
}

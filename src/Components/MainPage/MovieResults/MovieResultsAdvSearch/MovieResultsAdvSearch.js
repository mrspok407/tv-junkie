import React from "react"
// import MovieCardAdvSearch from "./MovieCardAdvSearch"
import "./MovieResultsAdvSearch.scss"
import Loader from "../../Placeholders/Loader"
import { listOfGenres } from "../../../../Utils"

export default class MovieResultsAdvSearch extends React.PureComponent {
  render() {
    console.log(this.props.advancedSearchMovies)
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
            ({
              original_title,
              original_name,
              id,
              release_date,
              first_air_date,
              vote_average,
              genre_ids,
              overview,
              backdrop_path,
              poster_path,
              vote_count
            }) => {
              const filteredGenres = genre_ids.map(genreId =>
                listOfGenres.filter(item => item.id === genreId)
              )

              const title = original_title || original_name
              const date = release_date || first_air_date
              return (
                <div
                  key={id}
                  className="movie-results__movie movie-results__movie--advanced"
                >
                  <div className="movie-results__movie--advanced-main-info">
                    <div className="movie-results__movie--advanced-title">
                      {!title ? "No title available" : title}
                    </div>
                    <div className="movie-results__movie--advanced-year">
                      ({!date ? "No data" : date.slice(0, 4)})
                    </div>
                    <div className="movie-results__movie--advanced-rating">
                      {vote_average}
                      <span>/10</span>
                      <span className="movie-results__movie--advanced-rating-vote-count">
                        ({vote_count})
                      </span>
                    </div>
                  </div>
                  <div className="movie-results__movie--advanced-genres">
                    {filteredGenres.map(item => (
                      <span key={item[0].id}>{item[0].name}</span>
                    ))}
                  </div>
                  <div className="movie-results__movie--advanced-overview">
                    <div className="movie-results__movie--advanced-poster">
                      <div
                        style={
                          backdrop_path !== null
                            ? {
                                backgroundImage: `url(https://image.tmdb.org/t/p/w500/${backdrop_path ||
                                  poster_path})`
                              }
                            : {
                                backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                              }
                        }
                      />
                    </div>
                    <div className="movie-results__movie--advanced-description">
                      {overview.length > 150
                        ? `${overview.substring(0, 150)}...`
                        : overview}
                    </div>
                  </div>
                  {this.props.selectedMovies.some(e => e.id === id) ? (
                    <button
                      className="button button--advanced-movies button--pressed"
                      onClick={() =>
                        this.props.toggleMovie(
                          id,
                          this.props.advancedSearchMovies
                        )
                      }
                      type="button"
                    >
                      Remove movie
                    </button>
                  ) : (
                    <button
                      className="button button--advanced-movies"
                      onClick={() =>
                        this.props.toggleMovie(
                          id,
                          this.props.advancedSearchMovies
                        )
                      }
                      type="button"
                    >
                      Add movie
                    </button>
                  )}
                </div>
                // <MovieCardAdvSearch
                //   key={id}
                //   title={title}
                //   year={release_date}
                //   id={id}
                //   voteAverage={vote_average}
                //   genreIds={genre_ids}
                //   poster={backdrop_path}
                //   posterBackdrop={poster_path}
                //   overview={overview}
                //   voteCount={vote_count}
                //   index={index}
                //   toggleMovie={this.props.toggleMovie}
                //   selectedMovies={this.props.selectedMovies}
                //   advancedSearchMovies={this.props.advancedSearchMovies}
                // />
              )
            }
          )}
        </div>
        {this.props.loadingNewPage && <Loader className="loader--new-page" />}
      </div>
    )
  }
}

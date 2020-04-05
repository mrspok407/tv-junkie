import React, { Component } from "react"
import { listOfGenres } from "../../Utils"

export default class Movies extends Component {
  render() {
    return (
      <div className="movie-results-cont">
        <div className="movie-results--advanced-wrapper">
          {this.props.selectedContent
            .filter(item => item.original_title)
            .map(
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
                    {this.props.selectedContent.some(e => e.id === id) ? (
                      <button
                        className="button button--advanced-movies button--pressed"
                        onClick={() =>
                          this.props.toggleContent(
                            id,
                            this.props.advancedSearchContent
                          )
                        }
                        type="button"
                      >
                        Remove {original_title ? "movie" : "show"}
                      </button>
                    ) : (
                      <button
                        className="button button--advanced-movies"
                        onClick={() =>
                          this.props.toggleContent(
                            id,
                            this.props.advancedSearchContent
                          )
                        }
                        type="button"
                      >
                        Add {original_title ? "movie" : "show"}
                      </button>
                    )}
                  </div>
                )
              }
            )}
        </div>
      </div>
    )
  }
}

import React, { Component } from "react"
import "./MovieList.scss"

export default class MovieList extends Component {
  componentDidMount() {
    document.addEventListener("mousedown", this.props.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.props.handleClickOutside)
  }

  render() {
    const { movies, toggleMovie, selectedMovies } = this.props
    return movies.map(({ title, poster_path, overview, id }) => (
      <div key={id} className="movie-list__movie-card">
        <div
          className="movie-card__poster"
          style={
            poster_path !== null
              ? {
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster_path})`
                }
              : {
                  backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
                }
          }
        />
        <div className="movie-card__info">
          <div className="movie-card__info-title">
            {title.length > 20 ? `${title.substring(0, 20)}...` : title}
          </div>
          <div className="movie-card__info-desc">
            {overview.length > 20
              ? `${overview.substring(0, 60)}...`
              : overview}
          </div>
          <div className="movie-card__add-movie">
            {selectedMovies.some(e => e.id === id) ? (
              <button
                className="button button--movielist button--pressed"
                onClick={() => toggleMovie(id, movies)}
                type="button"
              >
                Remove movie
              </button>
            ) : (
              <button
                className="button button--movielist"
                onClick={() => toggleMovie(id, movies)}
                type="button"
              >
                Add movie
              </button>
            )}
          </div>
        </div>
      </div>
    ))
  }
}

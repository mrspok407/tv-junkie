/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { Component } from "react"
import MovieCard from "./MovieCard"
import "./MovieList.scss"

export default class MovieList extends Component {
  // state = { movieCardHovered: false, movieCardId: "" }

  componentDidMount() {
    document.addEventListener("mousedown", this.props.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.props.handleClickOutside)
  }

  render() {
    const { movies, toggleMovie, selectedMovies } = this.props
    return movies.map(
      ({
        original_title,
        name = "",
        poster_path = "",
        profile_path = "",
        overview = "",
        id,
        known_for,
        known_for_department
      }) => {
        const isMovie = !!overview
        return (
          <MovieCard
            key={id}
            original_title={original_title}
            name={name}
            poster_path={poster_path}
            profile_path={profile_path}
            overview={overview}
            id={id}
            known_for={known_for}
            known_for_department={known_for_department}
            movies={movies}
            toggleMovie={toggleMovie}
            selectedMovies={selectedMovies}
            isMovie={isMovie}
          />
          // <div
          //   onMouseEnter={() => {
          //     this.setState({ movieCardHovered: true, movieCardId: id })
          //   }}
          //   onMouseLeave={() => {
          //     this.setState({ movieCardHovered: false, movieCardId: id })
          //   }}
          //   key={id}
          //   className="search-card"
          // >
          //   <div
          //     className="search-card__image"
          //     style={
          //       poster_path !== null
          //         ? {
          //             backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster_path ||
          //               profile_path})`
          //           }
          //         : {
          //             backgroundImage: `url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)`
          //           }
          //     }
          //   />
          //   <div className="search-card__info">
          //     <div
          //       className={`search-card__info-title ${
          //         this.state.movieCardHovered && this.state.movieCardId === id
          //           ? "search-card__info-title--hovered"
          //           : ""
          //       }`}
          //     >
          //       {original_title || name}
          //     </div>

          //     <div
          //       className={`search-card__info-description ${
          //         this.state.movieCardHovered && this.state.movieCardId === id
          //           ? "search-card__info-description--hovered"
          //           : ""
          //       }`}
          //     >
          //       {isMovie && (
          //         <div className="search-card__info-description--movie">
          //           {overview.length > 150
          //             ? `${overview.substring(0, 150)}...`
          //             : overview}
          //         </div>
          //       )}

          //       {!isMovie && (
          //         <div className="search-card__info-description--person">
          //           <div className="search-card__info-activity">
          //             Main activity: {known_for_department}
          //           </div>
          //           <div className="search-card__info-person-movies">
          //             {known_for.map((item, i) => (
          //               <span key={item.id}>
          //                 {item.original_title}
          //                 {known_for.length - 1 !== i
          //                   ? item.release_date
          //                     ? ` (${item.release_date.slice(0, 4)}), `
          //                     : ""
          //                   : item.release_date
          //                   ? ` (${item.release_date.slice(0, 4)})`
          //                   : ""}
          //               </span>
          //             ))}
          //           </div>
          //         </div>
          //       )}
          //     </div>

          //     <div
          //       className={
          //         isMovie
          //           ? "search-card__buttons"
          //           : "search-card__buttons search-card__buttons--person"
          //       }
          //     >
          //       {isMovie && (
          //         <div className="search-card__add-movie-btn">
          //           {selectedMovies.some(e => e.id === id) ? (
          //             <button
          //               className="button button--movielist button--pressed"
          //               onClick={() => toggleMovie(id, movies)}
          //               type="button"
          //             >
          //               Remove movie
          //             </button>
          //           ) : (
          //             <button
          //               className="button button--movielist"
          //               onClick={() => toggleMovie(id, movies)}
          //               type="button"
          //             >
          //               Add movie
          //             </button>
          //           )}
          //         </div>
          //       )}

          //       <div className="search-card__full-info-btn">
          //         <button className="button button--movielist" type="button">
          //           Full info
          //         </button>
          //       </div>
          //     </div>
          //   </div>
          // </div>
        )
      }
    )
  }
}

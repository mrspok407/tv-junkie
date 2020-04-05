import React from "react"
import { listOfGenres } from "../../../../Utils"
// import axios from "axios"

export default React.memo(function MovieCardAdvSearch({
  title = "No title available",
  year = "No data",
  id,
  selectedContent,
  toggleContent,
  advancedSearchContent,
  voteAverage = "",
  voteCount = "",
  genreIds = [],
  poster = "",
  posterBackdrop = "",
  overview = ""
}) {
  const filteredGenres = genreIds.map(genreId =>
    listOfGenres.filter(item => item.id === genreId)
  )

  // const title = original_title || original_name
  // const date = release_date || first_air_date

  return (
    <div className="movie-results__movie movie-results__movie--advanced">
      <div className="movie-results__movie--advanced-main-info">
        <div className="movie-results__movie--advanced-title">
          {!title ? "No title available" : title}
        </div>
        <div className="movie-results__movie--advanced-year">
          ({!year ? "No data" : year.slice(0, 4)})
        </div>
        <div className="movie-results__movie--advanced-rating">
          {voteAverage}
          <span>/10</span>
          <span className="movie-results__movie--advanced-rating-vote-count">
            ({voteCount})
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
              poster !== null || posterBackdrop !== null
                ? {
                    backgroundImage: `url(https://image.tmdb.org/t/p/w500${poster ||
                      posterBackdrop})`
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
      {selectedContent.some(e => e.id === id) ? (
        <button
          className="button button--advanced-movies button--pressed"
          onClick={() => toggleContent(id, advancedSearchContent)}
          type="button"
        >
          Remove movie
        </button>
      ) : (
        <button
          className="button button--advanced-movies"
          onClick={() => toggleContent(id, advancedSearchContent)}
          type="button"
        >
          Add movie
        </button>
      )}
    </div>
  )
})

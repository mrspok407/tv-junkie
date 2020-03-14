import React from "react"
// import axios from "axios"

export default React.memo(function MovieCardAdvSearch({
  title = "No title available",
  year = "No data",
  id,
  selectedMovies,
  toggleMovie,
  advancedSearchMovies,
  voteAverage = "",
  voteCount = "",
  genreIds = "",
  poster = "",
  overview = ""
}) {
  const listOfGenres = [
    {
      id: 28,
      name: "Action"
    },
    {
      id: 12,
      name: "Adventure"
    },
    {
      id: 16,
      name: "Animation"
    },
    {
      id: 35,
      name: "Comedy"
    },
    {
      id: 80,
      name: "Crime"
    },
    {
      id: 99,
      name: "Documentary"
    },
    {
      id: 18,
      name: "Drama"
    },
    {
      id: 10751,
      name: "Family"
    },
    {
      id: 14,
      name: "Fantasy"
    },
    {
      id: 36,
      name: "History"
    },
    {
      id: 27,
      name: "Horror"
    },
    {
      id: 10402,
      name: "Music"
    },
    {
      id: 9648,
      name: "Mystery"
    },
    {
      id: 10749,
      name: "Romance"
    },
    {
      id: 878,
      name: "Science Fiction"
    },
    {
      id: 10770,
      name: "TV Movie"
    },
    {
      id: 53,
      name: "Thriller"
    },
    {
      id: 10752,
      name: "War"
    },
    {
      id: 37,
      name: "Western"
    }
  ]

  const filteredGenres = genreIds.map(genreId =>
    listOfGenres.filter(item => item.id === genreId)
  )

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
              poster !== null
                ? {
                    backgroundImage: `url(https://image.tmdb.org/t/p/w500${poster})`
                  }
                : {
                    backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                  }
            }
          />
        </div>
        <div className="movie-results__movie--advanced-description">
          {overview}
        </div>
      </div>
      {selectedMovies.some(e => e.id === id) ? (
        <button
          className="button button--advanced-movies button--pressed"
          onClick={() => toggleMovie(id, advancedSearchMovies)}
          type="button"
        >
          Remove movie
        </button>
      ) : (
        <button
          className="button button--advanced-movies"
          onClick={() => toggleMovie(id, advancedSearchMovies)}
          type="button"
        >
          Add movie
        </button>
      )}
    </div>
  )
})

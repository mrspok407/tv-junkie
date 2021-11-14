import React from "react"
import { Link } from "react-router-dom"
import { listOfGenres } from "Utils"
import { ContentDetailes, CONTENT_DETAILS_DEFAULT } from "Utils/Interfaces/ContentDetails"
import Loader from "Components/UI/Placeholders/Loader"
import "./SearchResults.scss"

type Props = {
  advancedSearchContent: ContentDetailes[]
  loadingNewPage: boolean
  clearAdvSearchMovies: () => void
}

const AdvSearchResults: React.FC<Props> = ({ advancedSearchContent, loadingNewPage, clearAdvSearchMovies }) => {
  const maxColumns = 4
  const currentNumOfColumns = advancedSearchContent.length <= maxColumns - 1 ? advancedSearchContent.length : maxColumns

  return (
    <>
      <div className="content-results">
        {advancedSearchContent.length > 0 && (
          <div className="content-results__button-top">
            <button type="button" className="button" onClick={() => clearAdvSearchMovies()}>
              Clear Searched
            </button>
          </div>
        )}

        <div
          className="content-results__wrapper"
          style={
            currentNumOfColumns <= 3
              ? {
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 350px))"
                }
              : {
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
                }
          }
        >
          {advancedSearchContent.map(
            ({
              title,
              original_title,
              name,
              original_name,
              release_date,
              first_air_date,
              id = CONTENT_DETAILS_DEFAULT.id,
              vote_average = CONTENT_DETAILS_DEFAULT.vote_average,
              genre_ids = CONTENT_DETAILS_DEFAULT.genre_ids,
              overview = CONTENT_DETAILS_DEFAULT.overview,
              backdrop_path = CONTENT_DETAILS_DEFAULT.backdrop_path,
              poster_path = CONTENT_DETAILS_DEFAULT.poster_path,
              vote_count = CONTENT_DETAILS_DEFAULT.vote_count
            }) => {
              const mediaType = original_title ? "movie" : "show"

              const filteredGenres = genre_ids.map((genreId) => listOfGenres.filter((item) => item.id === genreId))

              const contentTitle = title || original_title || name || original_name || "-"
              const releaseDate = release_date || first_air_date || "-"

              return (
                <div key={id} className="content-results__item">
                  <Link
                    to={{
                      pathname: `/${mediaType}/${id}`,
                      state: { logoDisable: true }
                    }}
                  >
                    <div className="content-results__item-main-info">
                      <div className="content-results__item-title">
                        {!contentTitle ? "No title available" : contentTitle}
                      </div>
                      <div className="content-results__item-year">
                        {!releaseDate ? "" : `(${releaseDate.slice(0, 4)})`}
                      </div>
                      {vote_average !== 0 && (
                        <div className="content-results__item-rating">
                          {vote_average}
                          <span>/10</span>
                          <span className="content-results__item-rating-vote-count">({vote_count})</span>
                        </div>
                      )}
                    </div>
                    <div className="content-results__item-genres">
                      {filteredGenres.map((item) => (
                        <span key={item[0].id}>{item[0].name}</span>
                      ))}
                    </div>
                    <div className="content-results__item-overview">
                      <div className="content-results__item-poster">
                        <div
                          className="lazyload"
                          data-bg={
                            backdrop_path !== null
                              ? `https://image.tmdb.org/t/p/w500/${backdrop_path || poster_path}`
                              : "https://homestaymatch.com/images/no-image-available.png"
                          }
                        />
                      </div>
                      <div className="content-results__item-description">
                        {overview.length > 250 ? `${overview.substring(0, 250)}...` : overview}
                      </div>
                    </div>
                  </Link>
                </div>
              )
            }
          )}
          {loadingNewPage && <Loader className="loader--new-page" />}
        </div>
      </div>
    </>
  )
}

export default AdvSearchResults

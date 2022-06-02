import React from 'react'
import { Link } from 'react-router-dom'
import { LIST_OF_GENRES } from 'Utils/Constants'
import { DataTMDBAPIInterface, DATA_TMDBAPI_INITIAL } from 'Utils/Interfaces/DataTMDBAPIInterface'
import Loader from 'Components/UI/Placeholders/Loader'
import './SearchResults.scss'

type Props = {
  advancedSearchContent: DataTMDBAPIInterface[]
  loadingNewPage: boolean
  clearAdvSearchMovies: () => void
}

const AdvSearchResults: React.FC<Props> = ({ advancedSearchContent, loadingNewPage, clearAdvSearchMovies }) => {
  const maxColumns = 4
  const currentNumOfColumns = advancedSearchContent.length <= maxColumns - 1 ? advancedSearchContent.length : maxColumns

  return (
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 350px))',
              }
            : {
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
            id = DATA_TMDBAPI_INITIAL.id,
            vote_average = DATA_TMDBAPI_INITIAL.vote_average,
            genre_ids = DATA_TMDBAPI_INITIAL.genre_ids,
            overview = DATA_TMDBAPI_INITIAL.overview,
            backdrop_path = DATA_TMDBAPI_INITIAL.backdrop_path,
            poster_path = DATA_TMDBAPI_INITIAL.poster_path,
            vote_count = DATA_TMDBAPI_INITIAL.vote_count,
          }) => {
            const mediaType = original_title ? 'movie' : 'show'

            const filteredGenres =
              genre_ids?.map((genreId) => LIST_OF_GENRES.filter((item) => item.id === genreId)) || []

            const contentTitle = title || original_title || name || original_name || '-'
            const releaseDate = release_date || first_air_date || '-'

            return (
              <div key={id} className="content-results__item">
                <Link
                  to={{
                    pathname: `/${mediaType}/${id}`,
                    state: { logoDisable: true },
                  }}
                >
                  <div className="content-results__item-main-info">
                    <div className="content-results__item-title">
                      {!contentTitle ? 'No title available' : contentTitle}
                    </div>
                    <div className="content-results__item-year">
                      {!releaseDate ? '' : `(${releaseDate.slice(0, 4)})`}
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
                            : 'https://homestaymatch.com/images/no-image-available.png'
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
          },
        )}
        {loadingNewPage && <Loader className="loader--new-page" />}
      </div>
    </div>
  )
}

export default AdvSearchResults

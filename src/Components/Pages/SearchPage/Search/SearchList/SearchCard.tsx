import React from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { MainDataTMDB, MAINDATA_TMDB_INITIAL } from 'Utils/@TypesTMDB'

type Props = {
  details: MainDataTMDB
  index: number
  currentListItem: number
  mediaTypeSearching: string
  closeList: () => void
}

const SearchCard: React.FC<Props> = ({
  details: {
    title,
    original_title,
    name,
    original_name,
    first_air_date,
    release_date,
    vote_average = MAINDATA_TMDB_INITIAL.vote_average,
    origin_country = [],
    poster_path = MAINDATA_TMDB_INITIAL.poster_path,
    profile_path = MAINDATA_TMDB_INITIAL.profile_path,
    backdrop_path = MAINDATA_TMDB_INITIAL.backdrop_path,
    known_for = MAINDATA_TMDB_INITIAL.known_for,
    known_for_department = MAINDATA_TMDB_INITIAL.known_for_department,
    id = MAINDATA_TMDB_INITIAL.id,
    media_type = MAINDATA_TMDB_INITIAL.media_type,
  },
  mediaTypeSearching,
  index,
  currentListItem,
  closeList,
}) => {
  const movieTitle = title || original_title
  const showTitle = name || original_name
  const personName = name
  const releaseDate = first_air_date || release_date || '-'
  const type = movieTitle ? 'movie' : showTitle && 'show'

  return (
    <div
      key={id}
      className={classNames('search-card', {
        'search-card--person': media_type === 'person' || mediaTypeSearching === 'person',
        'search-card__active': index === currentListItem,
      })}
    >
      {media_type !== 'person' && mediaTypeSearching !== 'person' ? (
        <Link className="search-card__link" to={`/${type}/${id}`} onClick={() => closeList()}>
          <div className="search-card__info">
            <div
              className="search-card__info-image"
              style={
                poster_path !== null
                  ? {
                      backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster_path || backdrop_path})`,
                    }
                  : {
                      backgroundImage: 'url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)',
                    }
              }
            />
            <div className="search-card__info-title">
              {movieTitle || showTitle}
              <span className="search-card__info-year">{releaseDate && `(${releaseDate.slice(0, 4)})`}</span>
              <span className="search-card__info-country">
                {`${origin_country.length > 0 ? origin_country.join(', ') : ''}`}
              </span>
            </div>

            <div className="search-card__info-wrapper">
              {vote_average !== 0 && (
                <div className="search-card__info-rating">
                  {vote_average}
                  <span>/10</span>
                </div>
              )}
              <div className="search-card__info-type">{movieTitle ? 'Movie' : 'Show'}</div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="search-card__info search-card__info--person">
          <div
            className="search-card__info-image"
            style={
              profile_path !== null
                ? {
                    backgroundImage: `url(https://image.tmdb.org/t/p/w500/${profile_path})`,
                  }
                : {
                    backgroundImage: 'url(https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/500x735.png)',
                  }
            }
          />
          <div className="search-card__info-name">{movieTitle || showTitle || personName}</div>
          <div className="search-card__info-activity">
            Main activity:
            {known_for_department}
          </div>
          <div className="search-card__info-known-movies">
            {known_for.map((item, i) => {
              const mediaType = item.media_type === 'movie' ? 'movie' : 'show'

              const title = item.media_type === 'movie' ? item.original_title || 'No title' : item.name || 'No title'

              const releaseDate = item.media_type === 'movie' ? item.release_date || '' : item.first_air_date || ''

              return (
                <span key={item.id}>
                  <Link className="search-card__info-link" to={`/${mediaType}/${item.id}`} onClick={() => closeList()}>
                    {title}
                  </Link>

                  {known_for.length - 1 !== i ? ` (${releaseDate.slice(0, 4)}), ` : ` (${releaseDate.slice(0, 4)})`}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchCard

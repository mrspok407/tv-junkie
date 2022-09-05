import React from 'react'
import { MovieInfoStoreState } from 'Components/UserContent/UseUserMoviesRed/@Types'
import { Link } from 'react-router-dom'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { MovieSectionOptions } from '../../ReducerConfig/@Types'
import MoviesGridButtons from './MoviesGridButtons'

type Props = {
  data: MovieInfoStoreState[] | MainDataTMDB[]
  section: MovieSectionOptions
}

const MoviesGrid: React.FC<Props> = ({ data, section }) => {
  return (
    <>
      {data.map((item) => {
        return (
          <div key={item.id} className="content-results__item content-results__item--shows">
            <div className="content-results__item--shows-wrapper">
              <Link to={`/movie/${item.id}`}>
                <div className="content-results__item-main-info">
                  <div className="content-results__item-title">{!item.title ? 'No title available' : item.title}</div>
                  <div className="content-results__item-year">
                    {!item.release_date ? '' : `(${item.release_date.slice(0, 4)})`}
                  </div>
                  {item.vote_average !== 0 && (
                    <div className="content-results__item-rating">
                      {item.vote_average}
                      <span>/10</span>
                      <span className="content-results__item-rating-vote-count">({item.vote_count})</span>
                    </div>
                  )}
                </div>
                <div className="content-results__item-genres">
                  {item.genres?.map((item) => (
                    <span key={item.id}>{item.name}</span>
                  ))}
                </div>
                <div className="content-results__item-overview">
                  <div className="content-results__item-poster">
                    <div
                      className="lazyload"
                      data-bg={
                        item.backdrop_path !== null
                          ? `https://image.tmdb.org/t/p/w500/${item.backdrop_path}`
                          : 'https://homestaymatch.com/images/no-image-available.png'
                      }
                    />
                  </div>
                  <div className="content-results__item-description">
                    {item.overview?.length > 150 ? `${item.overview?.substring(0, 150)}...` : item.overview}
                  </div>
                </div>
              </Link>

              <MoviesGridButtons movieData={item} section={section} />
            </div>
          </div>
        )
      })}
    </>
  )
}

export default MoviesGrid

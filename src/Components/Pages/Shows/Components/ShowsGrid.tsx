import { useAppDispatch, useAppSelector } from 'app/hooks'
import { LocalStorageHandlersContext } from 'Components/AppContext/Contexts/LocalStorageContentContext/LocalStorageContentContext'
import { ShowFullDataStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { handleUserShowStatus } from 'Components/UserContent/UseUserShowsRed/ClientHandlers/showHandlers'
import { selectShows } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { MainDataTMDB } from 'Utils/@TypesTMDB'
import { LIST_OF_GENRES } from 'Utils/Constants'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  data: ShowFullDataStoreState[] | MainDataTMDB[]
  section: string
}

const ShowsGrid: React.FC<Props> = ({ data, section }) => {
  const { firebase } = useFrequentVariables()
  const localStorageHandlers = useContext(LocalStorageHandlersContext)

  const dispatch = useAppDispatch()
  const userShows = useAppSelector(selectShows)

  console.log('ShowsGrid Rerender')
  return (
    <>
      {data.map((item) => {
        const filteredGenres =
          item.genre_ids?.map((genreId) => LIST_OF_GENRES.filter((item) => item.id === genreId)) || []

        return (
          <div key={item.id} className="content-results__item content-results__item--shows">
            <div className="content-results__item--shows-wrapper">
              <Link to={`/show/${item.id}`}>
                <div className="content-results__item-main-info">
                  <div className="content-results__item-title">{!item.name ? 'No title available' : item.name}</div>
                  <div className="content-results__item-year">
                    {!item.first_air_date ? '' : `(${item.first_air_date.slice(0, 4)})`}
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
                  {filteredGenres.map((item) => (
                    <span key={item[0].id}>{item[0].name}</span>
                  ))}
                </div>
                <div className="content-results__item-overview">
                  <div className="content-results__item-poster">
                    <div
                      className="lazyload"
                      data-bg={
                        item.backdrop_path !== null
                          ? `https://image.tmdb.org/t/p/w500/${item.backdrop_path || item.poster_path}`
                          : 'https://homestaymatch.com/images/no-image-available.png'
                      }
                    />
                  </div>
                  <div className="content-results__item-description">
                    {item.overview?.length > 150 ? `${item.overview?.substring(0, 150)}...` : item.overview}
                  </div>
                </div>
              </Link>

              {section === 'watchingShows' ? (
                <div className="content-results__item-links content-results__item-links--adv-search">
                  <button
                    className="button"
                    onClick={() => {
                      dispatch(
                        handleUserShowStatus({
                          id: item.id,
                          database: 'notWatchingShows',
                          showFullDetailes: userShows[item.id],
                          firebase,
                          localStorageHandlers,
                        }),
                      )
                    }}
                    type="button"
                  >
                    Not watching
                  </button>
                </div>
              ) : (
                section !== 'finishedShows' && (
                  <div className="content-results__item-links content-results__item-links--adv-search">
                    <button
                      className="button"
                      onClick={() => {
                        dispatch(
                          handleUserShowStatus({
                            id: item.id,
                            database: 'watchingShows',
                            showFullDetailes: userShows[item.id],
                            firebase,
                            localStorageHandlers,
                          }),
                        )
                      }}
                      type="button"
                    >
                      Watching
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}

export default ShowsGrid

import { useAppDispatch, useAppSelector } from 'app/hooks'
import { UserShowsInterface } from 'Components/UserContent/UseUserShowsRed/@Types'
import { handleDatabaseChange } from 'Components/UserContent/UseUserShowsRed/FirebaseHelpers/PostData'
import { selectShows } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import React from 'react'
import { Link } from 'react-router-dom'
import { LIST_OF_GENRES } from 'Utils/Constants'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  data: UserShowsInterface[]
  section: string
}

const ShowsGrid: React.FC<Props> = ({ data, section }) => {
  const { authUser, firebase, userContentLocalStorage } = useFrequentVariables()
  const dispatch = useAppDispatch()
  const userShows = useAppSelector(selectShows)
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
                      if (authUser?.uid) {
                        dispatch(
                          handleDatabaseChange({
                            id: item.id,
                            database: 'notWatchingShows',
                            showDetailesTMDB: userShows[item.id],
                            uid: authUser?.uid,
                            firebase,
                          }),
                        )
                      } else {
                        userContentLocalStorage.removeShowLS({
                          id: item.id,
                        })
                      }
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
                        if (!authUser?.uid) return
                        dispatch(
                          handleDatabaseChange({
                            id: item.id,
                            database: 'watchingShows',
                            showDetailesTMDB: userShows[item.id],
                            uid: authUser?.uid,
                            firebase,
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

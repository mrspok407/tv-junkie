/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { Link } from 'react-router-dom'
import { listOfGenres } from 'Utils'
import { throttle } from 'throttle-debounce'
import classNames from 'classnames'
import PlaceholderNoShows from 'Components/UI/Placeholders/PlaceholderNoShows'
import Loader from 'Components/UI/Placeholders/Loader'
import { AppContext } from 'Components/AppContext/AppContextHOC'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectShows, selectShowsLoading } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { handleDatabaseChange } from 'Components/UserContent/UseUserShowsRed/FirebaseHelpers/PostData'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useAppSelectorArray from 'Utils/Hooks/UseAppSelectorArray'
import { UserShowsInterface } from 'Components/UserContent/UseUserShowsRed/@Types'
import reducer, { INITIAL_STATE, ShowsContentState, ActionInterface, ActionTypes } from './_reducerConfig'

const SCROLL_THRESHOLD = 800

const ShowsContent: React.FC = () => {
  const { firebase, authUser } = useFrequentVariables()
  const context = useContext(AppContext)
  const dispatch = useAppDispatch()

  const userShows = useAppSelectorArray<UserShowsInterface>(selectShows)
  const showsInitialLoading = useAppSelector(selectShowsLoading)

  const [sortByState, setSortByState] = useState('name')

  const [localState, localDispatch] = useReducer<React.Reducer<ShowsContentState, ActionInterface>>(
    reducer,
    INITIAL_STATE,
  )

  useEffect(() => {
    localDispatch({ type: ActionTypes.UpdateContext, payload: context })
  }, [context])

  const loadNewContent = () => {
    if (localState.disableLoad[localState.activeSection] || !authUser?.uid) return
    localDispatch({ type: ActionTypes.IncrementLoadedShows })
    localDispatch({ type: ActionTypes.DisableLoad, payload: { userShows } })
  }

  const loadNewContentLS = () => {
    if (localState.disableLoad.watchingShowsLS || !authUser?.uid) return
    localDispatch({ type: ActionTypes.IncrementLoadedShowsLS })
    localDispatch({ type: ActionTypes.DisableLoadLS })
  }

  const handleScroll = useCallback(
    throttle(500, () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
        loadNewContent()
        loadNewContentLS()
      }
    }),
    [localState.disableLoad, localState.activeSection],
  )
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const sortByHandler = (sortBy: string) => {
    if (sortBy === sortByState) return
    setSortByState(sortBy)
  }

  const toggleSection = (section: string) => {
    localDispatch({ type: ActionTypes.ChangeActiveSection, payload: section })
  }

  const renderContent = (section: string) => {
    const content = Object.values(userShows)
      .filter((show) => {
        if (section === 'finishedShows') {
          return show.finished
        }
        return show.database === section && !show.finished
      })
      .sort((a: any, b: any) =>
        // eslint-disable-next-line no-nested-ternary
        a[sortByState] > b[sortByState] ? (sortByState === 'timeStamp' ? -1 : 1) : sortByState !== 'timeStamp' ? -1 : 1,
      )
      .slice(0, localState.loadedShows[section])

    const shows = authUser?.uid
      ? content
      : context.userContentLocalStorage.watchingShows.slice(0, localState.loadedShows.watchingShowsLS)

    console.log(context.userContentLocalStorage)

    return (
      <>
        {shows.map((item) => {
          const filteredGenres = item.genre_ids.map((genreId) => listOfGenres.filter((item) => item.id === genreId))

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
                      {item.overview.length > 150 ? `${item.overview.substring(0, 150)}...` : item.overview}
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
                              showDetailes: userShows[item.id],
                              uid: authUser?.uid,
                              firebase,
                            }),
                          )
                        } else {
                          context.userContentLocalStorage.removeShowLS({
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
                              showDetailes: userShows[item.id],
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

  const content = Object.values(userShows).filter((show) => {
    if (localState.activeSection === 'finishedShows') {
      return show.finished
    }
    return show.database === localState.activeSection && !show.finished
  })

  // eslint-disable-next-line no-nested-ternary
  const shows = authUser?.uid
    ? content
    : localState.activeSection === 'watchingShows'
    ? context.userContentLocalStorage.watchingShows.slice(0, localState.loadedShows.watchingShowsLS)
    : []

  const maxColumns = 4
  const currentNumOfColumns = shows.length <= maxColumns - 1 ? shows.length : maxColumns

  const loadingShows = authUser?.uid ? showsInitialLoading : false
  const showPlaceHolder = !shows.length && !loadingShows && !context.userContentHandler.loadingShowsOnRegister

  return (
    <div className="content-results">
      <div className="buttons__row buttons__row--shows-page">
        <div className="buttons__col">
          <button
            className={classNames('button', {
              'button--pressed': localState.activeSection === 'watchingShows',
            })}
            type="button"
            onClick={() => toggleSection('watchingShows')}
          >
            Watching
          </button>
        </div>
        <div className="buttons__col">
          <button
            className={classNames('button', {
              'button--pressed': localState.activeSection === 'droppedShows',
            })}
            type="button"
            onClick={() => toggleSection('droppedShows')}
          >
            Dropped
          </button>
        </div>
        <div className="buttons__col">
          <button
            className={classNames('button', {
              'button--pressed': localState.activeSection === 'willWatchShows',
            })}
            type="button"
            onClick={() => toggleSection('willWatchShows')}
          >
            Will Watch
          </button>
        </div>
        <div className="buttons__col">
          <button
            className={classNames('button', {
              'button--pressed': localState.activeSection === 'finishedShows',
            })}
            type="button"
            onClick={() => toggleSection('finishedShows')}
          >
            Finished
          </button>
        </div>
      </div>

      {(loadingShows || context.userContentHandler.loadingShowsOnRegister) && <Loader className="loader--pink" />}

      {showPlaceHolder && <PlaceholderNoShows authUser={authUser} activeSection={localState.activeSection} />}

      {shows.length && (
        <>
          {authUser.uid && (
            <div className="content-results__sortby">
              <div className="content-results__sortby-text">Sort by:</div>
              <div className="content-results__sortby-buttons">
                <div
                  className={classNames('content-results__sortby-buttons', {
                    'content-results__sortby-button--active': sortByState === 'name',
                  })}
                >
                  <button type="button" className="button button--sortby-shows" onClick={() => sortByHandler('name')}>
                    Alphabetically
                  </button>
                </div>
                <div
                  className={classNames('content-results__sortby-button', {
                    'content-results__sortby-button--active': sortByState === 'timeStamp',
                  })}
                >
                  <button
                    type="button"
                    className="button button--sortby-shows"
                    onClick={() => sortByHandler('timeStamp')}
                  >
                    Recently added
                  </button>
                </div>
              </div>
            </div>
          )}
          <div
            className={classNames('content-results__wrapper', {
              'content-results__wrapper--finished-shows': localState.activeSection === 'finishedShows',
            })}
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
            {renderContent(localState.activeSection)}
          </div>
        </>
      )}
    </div>
  )
}

export default ShowsContent

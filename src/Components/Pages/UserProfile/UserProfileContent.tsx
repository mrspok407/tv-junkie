import React, { useState, useEffect, useCallback, useReducer } from 'react'
import { combineMergeObjects } from 'Utils'
import { LIST_OF_GENRES } from 'Utils/Constants'
import * as ROUTES from 'Utils/Constants/routes'
import { ShowInfoStoreState } from 'Components/UserContent/UseUserShowsRed/@Types'
import { ShowInterface } from 'Components/AppContext/@Types'
import merge from 'deepmerge'
import classNames from 'classnames'
import { Link, useHistory } from 'react-router-dom'
import Loader from 'Components/UI/Placeholders/Loader'
import PlaceholderNoShowsUser from 'Components/UI/Placeholders/PlaceholderNoShowsUser'
import UserRating from 'Components/UI/UserRating/UserRating'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useScrollEffect from 'Utils/Hooks/UseScrollEffect'
import reducer, { INITIAL_STATE, ShowsContentState, ActionInterface, ActionTypes } from './_reducerConfig'

const SCROLL_THRESHOLD = 800
const THROTTLE_TIMEOUT = 500

type Props = {
  userUid: string
}

const UserProfileContent: React.FC<Props> = ({ userUid }) => {
  const { firebase } = useFrequentVariables()
  const history = useHistory()

  const [loadingContent, setLoadingContent] = useState(true)
  const [sortByState, setSortByState] = useState('name')

  const [state, dispatch] = useReducer<React.Reducer<ShowsContentState, ActionInterface>>(reducer, INITIAL_STATE)

  const getUserShows = useCallback(async () => {
    const user = await firebase.user(userUid).child('username').once('value')
    if (user.val() === null) {
      setLoadingContent(false)
      history.push(ROUTES.PAGE_DOESNT_EXISTS)
      return
    }

    const userShowsData = await firebase.showsInfoUserDatabase(userUid).once('value')
    if (userShowsData.val() === null) {
      setLoadingContent(false)
      return
    }
    const userShows: ShowInfoStoreState[] = Object.values(userShowsData.val()).map((show: any) => show)

    const showsFromDatabase = await Promise.all(
      userShows.map((show) =>
        firebase
          .showInfo(show.id)
          .once('value')
          .then((snapshot: { val: () => ShowInterface }) => {
            if (snapshot.val() === null) return
            const info = snapshot.val()
            return { ...info }
          }),
      ),
    )

    const mergedShows: ShowInfoStoreState[] = merge(userShows, showsFromDatabase, {
      arrayMerge: combineMergeObjects,
    })

    dispatch({ type: ActionTypes.UpdateContent, payload: mergedShows })
    setLoadingContent(false)
  }, [userUid, firebase, history])

  useEffect(() => {
    getUserShows()
  }, [getUserShows])

  const loadNewContent = () => {
    if (state.disableLoad[state.activeSection]) return
    dispatch({ type: ActionTypes.IncrementLoadedShows })
    dispatch({ type: ActionTypes.DisableLoad })
  }

  useScrollEffect({ callback: loadNewContent, scrollThreshold: SCROLL_THRESHOLD, timeOut: THROTTLE_TIMEOUT })

  const sortByHandler = (sortBy: string) => {
    if (sortBy === sortByState) return
    setSortByState(sortBy)
  }

  const toggleSection = (section: string) => {
    dispatch({ type: ActionTypes.ChangeActiveSection, payload: section })
  }

  const renderContent = (section: string) => {
    const content = state.content
      .filter((show) => {
        if (section === 'finishedShows') {
          return show.finished
        }
        return show.database === section && !show.finished
      })
      // @ts-ignore
      // eslint-disable-next-line
      .sort((a, b) => {
        if (sortByState === 'timeStamp') {
          return a[sortByState] > b[sortByState] ? -1 : 1
        }
        if (sortByState === 'name') {
          return a[sortByState] > b[sortByState] ? 1 : -1
        }
        if (sortByState === 'userRating') {
          const sortValueOne = !a[sortByState] ? 0 : Number(a[sortByState])
          const sortValueTwo = !b[sortByState] ? 0 : Number(b[sortByState])
          return sortValueOne > sortValueTwo ? -1 : 1
        }
      })
      .slice(0, state.loadedShows[section])

    return (
      <>
        {content.map((item) => {
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
                      {item.overview.length > 150 ? `${item.overview.substring(0, 150)}...` : item.overview}
                    </div>
                  </div>
                  <UserRating userRatingData={item.userRating} id={item.id} firebaseRef="" disableRating />
                </Link>
              </div>
            </div>
          )
        })}
      </>
    )
  }

  const activeSectionContent = state.content.filter((show) => {
    if (state.activeSection === 'finishedShows') {
      return show.finished
    }
    return show.database === state.activeSection && !show.finished
  })

  const maxColumns = 4
  const currentNumOfColumns = activeSectionContent.length <= maxColumns - 1 ? activeSectionContent.length : maxColumns
  return (
    <div className="content-results">
      <div className="buttons__row buttons__row--shows-page">
        <div className="buttons__col">
          <button
            className={classNames('button', {
              'button--pressed': state.activeSection === 'watchingShows',
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
              'button--pressed': state.activeSection === 'droppedShows',
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
              'button--pressed': state.activeSection === 'willWatchShows',
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
              'button--pressed': state.activeSection === 'finishedShows',
            })}
            type="button"
            onClick={() => toggleSection('finishedShows')}
          >
            Finished
          </button>
        </div>
      </div>

      {loadingContent ? (
        <Loader className="loader--pink" />
      ) : activeSectionContent.length === 0 ? (
        <PlaceholderNoShowsUser activeSection={state.activeSection} />
      ) : (
        <>
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
              <div
                className={classNames('content-results__sortby-button', {
                  'content-results__sortby-button--active': sortByState === 'userRating',
                })}
              >
                <button
                  type="button"
                  className="button button--sortby-shows"
                  onClick={() => sortByHandler('userRating')}
                >
                  User rating
                </button>
              </div>
            </div>
          </div>

          <div
            className={classNames('content-results__wrapper', {
              'content-results__wrapper--finished-shows': state.activeSection === 'finishedShows',
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
            {renderContent(state.activeSection)}
          </div>
        </>
      )}
    </div>
  )
}

export default UserProfileContent

import React, { useCallback, useContext, useEffect, useReducer, useState } from "react"
import { Link } from "react-router-dom"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import PlaceholderNoShows from "Components/UI/Placeholders/PlaceholderNoShows"
import Loader from "Components/UI/Placeholders/Loader"
import { AppContext } from "Components/AppContext/AppContextHOC"
import reducer, { INITIAL_STATE, ShowsContentState, ActionInterface, ActionTypes } from "./_reducerConfig"

const SCROLL_THRESHOLD = 800

const ShowsContent: React.FC = () => {
  const [sortByState, setSortByState] = useState("name")

  const context = useContext(AppContext)
  const { authUser } = context

  const [state, dispatch] = useReducer<React.Reducer<ShowsContentState, ActionInterface>>(
    reducer,
    INITIAL_STATE
  )

  useEffect(() => {
    dispatch({ type: ActionTypes.UpdateContext, payload: context })
  }, [context])

  const loadNewContent = () => {
    if (state.disableLoad[state.activeSection] || authUser === null) return
    dispatch({ type: ActionTypes.IncrementLoadedShows })
    dispatch({ type: ActionTypes.DisableLoad })
  }

  const loadNewContentLS = () => {
    if (state.disableLoad.watchingShowsLS || authUser !== null) return
    dispatch({ type: ActionTypes.IncrementLoadedShowsLS })
    dispatch({ type: ActionTypes.DisableLoadLS })
  }

  const handleScroll = useCallback(
    throttle(500, () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
        loadNewContent()
        loadNewContentLS()
      }
    }),
    [state.disableLoad, state.activeSection]
  )
  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  const sortByHandler = (sortBy: string) => {
    if (sortBy === sortByState) return
    setSortByState(sortBy)
  }

  const toggleSection = (section: string) => {
    dispatch({ type: ActionTypes.ChangeActiveSection, payload: section })
  }

  const renderContent = (section: string) => {
    const content = context.userContent.userShows
      .filter((show) => {
        if (section === "finishedShows") {
          return show.finished
        } else {
          return show.database === section && !show.finished
        }
      })
      .sort((a, b) =>
        // @ts-ignore
        a[sortByState] > b[sortByState]
          ? sortByState === "timeStamp"
            ? -1
            : 1
          : sortByState !== "timeStamp"
          ? -1
          : 1
      )
      .slice(0, state.loadedShows[section])

    const shows = authUser
      ? content
      : context.userContentLocalStorage.watchingShows.slice(0, state.loadedShows.watchingShowsLS)

    return (
      <>
        {shows.map((item) => {
          const filteredGenres = item.genre_ids.map((genreId) =>
            listOfGenres.filter((item) => item.id === genreId)
          )

          return (
            <div key={item.id} className="content-results__item content-results__item--shows">
              <div className="content-results__item--shows-wrapper">
                <Link to={`/show/${item.id}`}>
                  <div className="content-results__item-main-info">
                    <div className="content-results__item-title">
                      {!item.name ? "No title available" : item.name}
                    </div>
                    <div className="content-results__item-year">
                      {!item.first_air_date ? "" : `(${item.first_air_date.slice(0, 4)})`}
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
                        style={
                          item.backdrop_path !== null
                            ? {
                                backgroundImage: `url(https://image.tmdb.org/t/p/w500/${
                                  item.backdrop_path || item.poster_path
                                })`
                              }
                            : {
                                backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                              }
                        }
                      />
                    </div>
                    <div className="content-results__item-description">
                      {item.overview.length > 150 ? `${item.overview.substring(0, 150)}...` : item.overview}
                    </div>
                  </div>
                </Link>

                {section === "watchingShows" ? (
                  <div className="content-results__item-links content-results__item-links--adv-search">
                    <button
                      className="button"
                      onClick={() => {
                        if (authUser) {
                          context.userContentHandler.handleShowInDatabases({
                            id: item.id,
                            data: item,
                            database: "notWatchingShows",
                            userShows: context.userContent.userShows
                          })
                          context.userContent.handleUserShowsOnClient({
                            database: "notWatchingShows",
                            id: item.id
                          })
                        } else {
                          context.userContentLocalStorage.removeShowLS({
                            id: item.id
                          })
                        }
                      }}
                      type="button"
                    >
                      Not watching
                    </button>
                  </div>
                ) : (
                  section !== "finishedShows" && (
                    <div className="content-results__item-links content-results__item-links--adv-search">
                      <button
                        className="button"
                        onClick={() => {
                          context.userContentHandler.handleShowInDatabases({
                            id: item.id,
                            data: item,
                            database: "watchingShows",
                            userShows: context.userContent.userShows
                          })
                          context.userContent.handleUserShowsOnClient({
                            database: "watchingShows",
                            id: item.id
                          })
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

  const content = context.userContent.userShows.filter((show) => {
    if (state.activeSection === "finishedShows") {
      return show.finished
    } else {
      return show.database === state.activeSection && !show.finished
    }
  })

  const shows = authUser
    ? content
    : state.activeSection === "watchingShows"
    ? context.userContentLocalStorage.watchingShows.slice(0, state.loadedShows.watchingShowsLS)
    : []

  const maxColumns = 4
  const currentNumOfColumns = shows.length <= maxColumns - 1 ? shows.length : maxColumns

  const loadingShows = authUser ? context.userContent.loadingShows : false

  return (
    <div className="content-results">
      <div className="buttons__row buttons__row--shows-page">
        <div className="buttons__col">
          <button
            className={classNames("button", {
              "button--pressed": state.activeSection === "watchingShows"
            })}
            type="button"
            onClick={() => toggleSection("watchingShows")}
          >
            Watching
          </button>
        </div>
        <div className="buttons__col">
          <button
            className={classNames("button", {
              "button--pressed": state.activeSection === "droppedShows"
            })}
            type="button"
            onClick={() => toggleSection("droppedShows")}
          >
            Dropped
          </button>
        </div>
        <div className="buttons__col">
          <button
            className={classNames("button", {
              "button--pressed": state.activeSection === "willWatchShows"
            })}
            type="button"
            onClick={() => toggleSection("willWatchShows")}
          >
            Will Watch
          </button>
        </div>
        <div className="buttons__col">
          <button
            className={classNames("button", {
              "button--pressed": state.activeSection === "finishedShows"
            })}
            type="button"
            onClick={() => toggleSection("finishedShows")}
          >
            Finished
          </button>
        </div>
      </div>

      {loadingShows || context.userContentHandler.loadingShowsOnRegister ? (
        <Loader className="loader--pink" />
      ) : shows.length === 0 ? (
        <PlaceholderNoShows authUser={authUser} activeSection={state.activeSection} />
      ) : (
        <>
          {authUser && (
            <div className="content-results__sortby">
              <div className="content-results__sortby-text">Sort by:</div>
              <div className="content-results__sortby-buttons">
                <div
                  className={classNames("content-results__sortby-buttons", {
                    "content-results__sortby-button--active": sortByState === "name"
                  })}
                >
                  <button
                    type="button"
                    className="button button--sortby-shows"
                    onClick={() => sortByHandler("name")}
                  >
                    Alphabetically
                  </button>
                </div>
                <div
                  className={classNames("content-results__sortby-button", {
                    "content-results__sortby-button--active": sortByState === "timeStamp"
                  })}
                >
                  <button
                    type="button"
                    className="button button--sortby-shows"
                    onClick={() => sortByHandler("timeStamp")}
                  >
                    Recently added
                  </button>
                </div>
              </div>
            </div>
          )}
          <div
            className={classNames("content-results__wrapper", {
              "content-results__wrapper--finished-shows": state.activeSection === "finishedShows"
            })}
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
            {renderContent(state.activeSection)}
          </div>
        </>
      )}
    </div>
  )
}

export default ShowsContent

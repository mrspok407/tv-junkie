import React, { useCallback, useContext, useEffect, useReducer, useState } from "react"
import { Link } from "react-router-dom"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import Loader from "Components/UI/Placeholders/Loader"
import PlaceholderNoMovies from "Components/UI/Placeholders/PlaceholderNoMovies"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"
import reducer, { INITIAL_STATE, MoviesContentState, ActionInterface, ActionTypes } from "./_reducerConfig"

const SCROLL_THRESHOLD = 800

type Props = {
  moviesData: ContentDetailes[]
  loadingIds: number[]
  openLinksMoviesId: number[]
  error: number[]
  getMovieLinks: ({ id }: { id: number }) => void
}

const MoviesContent: React.FC<Props> = ({
  moviesData,
  loadingIds,
  openLinksMoviesId,
  error,
  getMovieLinks
}) => {
  const [sortByState, setSortByState] = useState("title")

  const context = useContext(AppContext)
  const { authUser } = context

  const [state, dispatch] = useReducer<React.Reducer<MoviesContentState, ActionInterface>>(
    reducer,
    INITIAL_STATE
  )

  useEffect(() => {
    dispatch({ type: ActionTypes.UpdateContext, payload: context })
  }, [context])

  const loadNewContent = () => {
    if (state.disableLoad[state.activeSection] || authUser === null) return
    console.log("loadNewContent")
    dispatch({ type: ActionTypes.IncrementLoadedMovies })
    dispatch({ type: ActionTypes.DisableLoad })
  }

  const loadNewContentLS = () => {
    if (state.disableLoad.watchLaterMoviesLS || authUser !== null) return
    console.log("loadNewContentLS")
    dispatch({ type: ActionTypes.IncrementLoadedMoviesLS })
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

  const renderContent = (section: string) => {
    const content = context.userContent.userMovies
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
      .slice(0, state.loadedMovies[section])

    const movies = authUser
      ? content
      : context.userContentLocalStorage.watchLaterMovies.slice(0, state.loadedMovies.watchLaterMoviesLS)

    return (
      <>
        {movies.map((item) => {
          const filteredGenres = item.genre_ids.map((genreId) =>
            listOfGenres.filter((item) => item.id === genreId)
          )

          // Movies //
          let movie
          let urlMovieTitle
          let movieHash1080p
          let movieHash720p

          if (moviesData) {
            movie = moviesData.find((movie) => movie.id === item.id)
          }

          if (movie) {
            const hash1080p = movie.torrents.find((item) => item.quality === "1080p")
            movieHash1080p = hash1080p && hash1080p.hash

            const hash720p = movie.torrents.find((item) => item.quality === "720p")
            movieHash720p = hash720p && hash720p.hash

            urlMovieTitle = movie.title.split(" ").join("+")
          }
          // Movies end //
          return (
            <div key={item.id} className="content-results__item  content-results__item--movies">
              <div className="content-results__item--movies-wrapper">
                <Link
                  to={{
                    pathname: `/movie/${item.id}`,
                    state: { logoDisable: true, y: 300 }
                  }}
                >
                  <div className="content-results__item-main-info">
                    <div className="content-results__item-title">
                      {!item.title ? "No title available" : item.title}
                    </div>
                    <div className="content-results__item-year">
                      {!item.release_date ? "" : `(${item.release_date.slice(0, 4)})`}
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

                <div className="content-results__item-links">
                  {!openLinksMoviesId.includes(item.id) ? (
                    <button type="button" className="button" onClick={() => getMovieLinks({ id: item.id })}>
                      Show Links
                    </button>
                  ) : loadingIds.includes(item.id) && !error.includes(item.id) ? (
                    <div>
                      <Loader className="loader--small-pink" />
                    </div>
                  ) : (
                    loadingIds.includes(item.id) && (
                      <div className="content-results__item-links--error">No links available</div>
                    )
                  )}

                  {movie && (
                    <div className="content-results__item-links-wrapper">
                      <div className="torrent-links">
                        {movieHash1080p && (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`magnet:?xt=urn:btih:${movieHash1080p}&dn=${urlMovieTitle}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                          >
                            1080p
                          </a>
                        )}
                        {movieHash720p && (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`magnet:?xt=urn:btih:${movieHash720p}&dn=${urlMovieTitle}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                          >
                            720p
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="button--del-item"
                  onClick={() => {
                    if (authUser) {
                      context.userContentHandler.handleMovieInDatabases({
                        id: item.id,
                        data: item
                      })
                      context.userContent.handleUserMoviesOnClient({ id: item.id })
                    } else {
                      context.userContentLocalStorage.toggleMovieLS({
                        id: item.id,
                        data: movies
                      })
                    }
                  }}
                  type="button"
                />
              </div>
            </div>
          )
        })}
      </>
    )
  }

  const movies = authUser ? context.userContent.userMovies : context.userContentLocalStorage.watchLaterMovies
  const maxColumns = 4
  const currentNumOfColumns = movies.length <= maxColumns - 1 ? movies.length : maxColumns

  const loadingMovies = authUser ? context.userContent.loadingMovies : false

  return (
    <div className="content-results">
      {loadingMovies ? (
        <Loader className="loader--pink" />
      ) : movies.length === 0 ? (
        <PlaceholderNoMovies />
      ) : (
        <>
          {authUser && (
            <div className="content-results__sortby">
              <div className="content-results__sortby-text">Sort by:</div>
              <div className="content-results__sortby-buttons">
                <div
                  className={classNames("content-results__sortby-buttons", {
                    "content-results__sortby-button--active": sortByState === "title"
                  })}
                >
                  <button
                    type="button"
                    className="button button--sortby-shows"
                    onClick={() => sortByHandler("title")}
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
            {renderContent(state.activeSection)}
          </div>
        </>
      )}
    </div>
  )
}

export default MoviesContent

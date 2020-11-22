import React, { Component, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import Loader from "Components/UI/Placeholders/Loader"
import PlaceholderNoMovies from "Components/UI/Placeholders/PlaceholderNoMovies"
import PlaceholderLoadingContentResultsItem from "Components/UI/Placeholders/PlaceholderLoadingSortBy/PlaceholderLoadingContentResultsItem"
import { AppContext } from "Components/AppContext/AppContextHOC"
import useAuthUser from "Components/UserAuth/Session/WithAuthentication/UseAuthUser"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

const MOVIES_TO_LOAD_INITIAL = 5
const SCROLL_THRESHOLD = 800

type Props = {
  moviesData: ContentDetailes[]
  loadingIds: number[]
  openLinksMoviesId: number[]
  error: number[]
  getMovieLinks: ({ id }: { id: number }) => void
}

interface DisableLoadInterface {
  [key: string]: boolean
  watchLaterMovies: boolean
  watchLaterMoviesLS: boolean
}

interface LoadedMoviesInterface {
  [key: string]: number
  watchLaterMovies: number
  watchLaterMoviesLS: number
}

const initial_state = {
  watchLaterMovies: MOVIES_TO_LOAD_INITIAL
}

function reducer(state: any, action: any) {
  switch (action.type) {
    case "addLoadedMovies":
      return { watchLaterMovies: state.watchLaterMovies + action.payload }
    default:
      throw new Error()
  }
}

let test: any

const MoviesContent: React.FC<Props> = ({
  moviesData,
  loadingIds,
  openLinksMoviesId,
  error,
  getMovieLinks
}) => {
  const [activeSection, setActiveSection] = useState<string>("watchLaterMovies")
  const [sortByState, setSortByState] = useState("title")
  const [disableLoad, setDisableLoad] = useState<DisableLoadInterface>({
    watchLaterMovies: false,
    watchLaterMoviesLS: false
  })
  const [loadedMovies, setLoadedMovies] = useState<LoadedMoviesInterface>({
    watchLaterMovies: MOVIES_TO_LOAD_INITIAL,
    watchLaterMoviesLS: MOVIES_TO_LOAD_INITIAL
  })

  const context = useContext(AppContext)
  const authUser = useAuthUser()

  const [state, dispatch] = useReducer(reducer, initial_state)

  test = state

  const ttt = useRef<number>(null!)

  const handleScroll = throttle(500, () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
      loadNewContent()
      // loadNewContentLS()
    }
  })

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    console.log("useEffect")
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // const loadNewContent = useCallback(() => {
  //   // console.log(state.watchLaterMovies)
  //   // console.log(test)
  //   // dispatch({ type: "addLoadedMovies" })
  // }, [])

  useEffect(() => {
    ttt.current = loadedMovies.watchLaterMovies
  }, [loadedMovies])

  console.log(loadedMovies)

  const loadNewContent = () => {
    // if (disableLoad[activeSection]) return
    if (ttt.current > 20) return

    // dispatch({ type: "addLoadedMovies", payload: MOVIES_TO_LOAD_INITIAL })

    // console.log(state)

    console.log(ttt)
    console.log(loadedMovies)

    setLoadedMovies({
      ...loadedMovies,
      [activeSection]: ttt.current + MOVIES_TO_LOAD_INITIAL
    })

    // setDisableLoad({
    //   ...disableLoad,
    //   [activeSection]: !!(loadedMovies[activeSection] >= context.userContent.userMovies.length)
    // })
  }

  const loadNewContentLS = () => {
    if (disableLoad.watchLaterMoviesLS || authUser === null) return

    setLoadedMovies({
      ...loadedMovies,
      watchLaterMoviesLS: loadedMovies.watchLaterMoviesLS + MOVIES_TO_LOAD_INITIAL
    })

    setDisableLoad({
      ...disableLoad,
      watchLaterMoviesLS: !!(
        loadedMovies.watchLaterMoviesLS >= context.userContentLocalStorage.watchLaterMovies.length
      )
    })
  }

  // const handleScroll = useCallback(
  //   throttle(500, () => {
  //     if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
  //       // loadNewContent()
  //       // loadNewContentLS()
  //       if (disableLoad[activeSection]) return

  //       console.log("loadNewContent")
  //       console.log(context.userContent.userMovies)
  //       console.log(loadedMovies)
  //       console.log(disableLoad)

  //       setLoadedMovies({
  //         ...loadedMovies,
  //         [activeSection]: loadedMovies[activeSection] + MOVIES_TO_LOAD_INITIAL
  //       })

  //       setDisableLoad({
  //         ...disableLoad,
  //         [activeSection]: !!(loadedMovies[activeSection] >= context.userContent.userMovies.length)
  //       })
  //     }
  //   }),
  //   [context, loadedMovies, disableLoad]
  // )

  // const handleScroll = useCallback(
  //   throttle(500, () => {
  //     console.log(state.watchLaterMovies)
  //     if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
  //       loadNewContent(state.watchLaterMovies)
  //       // loadNewContentLS()
  //     }
  //   }),
  //   [state]
  // )

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
      .slice(0, loadedMovies[section])

    const movies = authUser
      ? content
      : context.userContentLocalStorage.watchLaterMovies.slice(0, loadedMovies.watchLaterMoviesLS)

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
            {renderContent(activeSection)}
          </div>
        </>
      )}
    </div>
  )
}

export default MoviesContent

// class MoviesContent extends Component {
//   state = {
//     activeSection: "watchLaterMovies",
//     sortBy: "title",
//     disableLoad: {
//       watchLaterMovies: false,
//       watchLaterMoviesLS: false
//     },
//     loadedMovies: {
//       watchLaterMovies: MOVIES_TO_LOAD_INITIAL,
//       watchLaterMoviesLS: MOVIES_TO_LOAD_INITIAL
//     }
//   }

//   componentDidMount() {
//     window.addEventListener("scroll", this.handleScroll)
//   }

//   componentWillUnmount() {
//     window.removeEventListener("scroll", this.handleScroll)
//   }

//   loadNewContent = () => {
//     if (this.state.disableLoad[this.state.activeSection]) return

//     this.setState({
//       loadedMovies: {
//         ...this.state.loadedMovies,
//         [this.state.activeSection]: this.state.loadedMovies[this.state.activeSection] + MOVIES_TO_LOAD_INITIAL
//       },
//       disableLoad: {
//         ...this.state.disableLoad,
//         [this.state.activeSection]: !!(
//           this.state.loadedMovies[this.state.activeSection] >= this.context.userContent.userMovies.length
//         )
//       }
//     })
//   }

//   loadNewContentLS = () => {
//     if (this.state.disableLoad.watchLaterMoviesLS || this.context.authUser === null) return

//     this.setState({
//       loadedMovies: {
//         ...this.state.loadedMovies,
//         watchLaterMoviesLS: this.state.loadedMovies.watchLaterMoviesLS + MOVIES_TO_LOAD_INITIAL
//       },
//       disableLoad: {
//         ...this.state.disableLoad,
//         watchLaterMoviesLS:
//           this.state.loadedMovies.watchLaterMoviesLS >=
//             this.context.userContentLocalStorage.watchLaterMovies.length && true
//       }
//     })
//   }

//   handleScroll = throttle(500, () => {
//     if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
//       this.loadNewContent()
//       this.loadNewContentLS()
//     }
//   })

//   sortBy = (sortBy) => {
//     if (this.state.sortBy === sortBy) return

//     this.setState({ sortBy })
//   }

//   renderContent = (section) => {
//     const content = this.context.userContent.userMovies
//       .sort((a, b) =>
//         a[this.state.sortBy] > b[this.state.sortBy]
//           ? this.state.sortBy === "timeStamp"
//             ? -1
//             : 1
//           : this.state.sortBy !== "timeStamp"
//           ? -1
//           : 1
//       )
//       .slice(0, this.state.loadedMovies[section])

//     const movies = this.context.authUser
//       ? content
//       : this.context.userContentLocalStorage.watchLaterMovies.slice(
//           0,
//           this.state.loadedMovies.watchLaterMoviesLS
//         )

//     return (
//       <>
//         {movies.map((item) => {
//           const filteredGenres = item.genre_ids.map((genreId) =>
//             listOfGenres.filter((item) => item.id === genreId)
//           )

//           // Movies //
//           let movie
//           let urlMovieTitle
//           let movieHash1080p
//           let movieHash720p

//           if (this.props.moviesData) {
//             movie = this.props.moviesData.find((movie) => movie.id === item.id)
//           }

//           if (movie) {
//             const hash1080p = movie.torrents.find((item) => item.quality === "1080p")
//             movieHash1080p = hash1080p && hash1080p.hash

//             const hash720p = movie.torrents.find((item) => item.quality === "720p")
//             movieHash720p = hash720p && hash720p.hash

//             urlMovieTitle = movie.title.split(" ").join("+")
//           }
//           // Movies end //
//           return (
//             <div key={item.id} className="content-results__item  content-results__item--movies">
//               {this.state.sortByLoading ? (
//                 <PlaceholderLoadingContentResultsItem delayAnimation="0.5s" />
//               ) : (
//                 <div className="content-results__item--movies-wrapper">
//                   <Link
//                     to={{
//                       pathname: `/movie/${item.id}`,
//                       state: { logoDisable: true, y: 300 }
//                     }}
//                   >
//                     <div className="content-results__item-main-info">
//                       <div className="content-results__item-title">
//                         {!item.title ? "No title available" : item.title}
//                       </div>
//                       <div className="content-results__item-year">
//                         {!item.release_date ? "" : `(${item.release_date.slice(0, 4)})`}
//                       </div>
//                       {item.vote_average !== 0 && (
//                         <div className="content-results__item-rating">
//                           {item.vote_average}
//                           <span>/10</span>
//                           <span className="content-results__item-rating-vote-count">({item.vote_count})</span>
//                         </div>
//                       )}
//                     </div>
//                     <div className="content-results__item-genres">
//                       {filteredGenres.map((item) => (
//                         <span key={item[0].id}>{item[0].name}</span>
//                       ))}
//                     </div>
//                     <div className="content-results__item-overview">
//                       <div className="content-results__item-poster">
//                         <div
//                           style={
//                             item.backdrop_path !== null
//                               ? {
//                                   backgroundImage: `url(https://image.tmdb.org/t/p/w500/${
//                                     item.backdrop_path || item.poster_path
//                                   })`
//                                 }
//                               : {
//                                   backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
//                                 }
//                           }
//                         />
//                       </div>
//                       <div className="content-results__item-description">
//                         {item.overview.length > 150 ? `${item.overview.substring(0, 150)}...` : item.overview}
//                       </div>
//                     </div>
//                   </Link>

//                   <div className="content-results__item-links">
//                     {!this.props.openLinksMoviesId.includes(item.id) ? (
//                       <button
//                         type="button"
//                         className="button"
//                         onClick={() => this.props.getMovieLinks({ id: item.id })}
//                       >
//                         Show Links
//                       </button>
//                     ) : this.props.loadingIds.includes(item.id) && !this.props.error.includes(item.id) ? (
//                       <div>
//                         <Loader className="loader--small-pink" />
//                       </div>
//                     ) : (
//                       this.props.loadingIds.includes(item.id) && (
//                         <div className="content-results__item-links--error">No links available</div>
//                       )
//                     )}

//                     {movie && (
//                       <div className="content-results__item-links-wrapper">
//                         <div className="torrent-links">
//                           {movieHash1080p && (
//                             <a
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               href={`magnet:?xt=urn:btih:${movieHash1080p}&dn=${urlMovieTitle}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
//                             >
//                               1080p
//                             </a>
//                           )}
//                           {movieHash720p && (
//                             <a
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               href={`magnet:?xt=urn:btih:${movieHash720p}&dn=${urlMovieTitle}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
//                             >
//                               720p
//                             </a>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   <button
//                     className="button--del-item"
//                     onClick={() => {
//                       if (this.context.authUser) {
//                         this.context.userContentHandler.handleMovieInDatabases({
//                           id: item.id,
//                           data: item
//                         })
//                         this.context.userContent.handleUserMoviesOnClient({ id: item.id })
//                       } else {
//                         this.context.userContentLocalStorage.toggleMovieLS({
//                           id: item.id,
//                           data: movies
//                         })
//                       }
//                     }}
//                     type="button"
//                   />
//                 </div>
//               )}
//             </div>
//           )
//         })}
//       </>
//     )
//   }

//   render() {
//     const movies = this.context.authUser
//       ? this.context.userContent.userMovies
//       : this.context.userContentLocalStorage.watchLaterMovies
//     const maxColumns = 4
//     const currentNumOfColumns = movies.length <= maxColumns - 1 ? movies.length : maxColumns

//     const loadingMovies = this.context.authUser ? this.context.userContent.loadingMovies : false

//     return (
//       <div className="content-results">
//         {loadingMovies ? (
//           <Loader className="loader--pink" />
//         ) : movies.length === 0 ? (
//           <PlaceholderNoMovies />
//         ) : (
//           <>
//             {this.context.authUser && (
//               <div className="content-results__sortby">
//                 <div className="content-results__sortby-text">Sort by:</div>
//                 <div className="content-results__sortby-buttons">
//                   <div
//                     className={classNames("content-results__sortby-buttons", {
//                       "content-results__sortby-button--active": this.state.sortBy === "title"
//                     })}
//                   >
//                     <button
//                       type="button"
//                       className="button button--sortby-shows"
//                       onClick={() => this.sortBy("title", true)}
//                     >
//                       title
//                     </button>
//                   </div>
//                   <div
//                     className={classNames("content-results__sortby-button", {
//                       "content-results__sortby-button--active": this.state.sortBy === "timeStamp"
//                     })}
//                   >
//                     <button
//                       type="button"
//                       className="button button--sortby-shows"
//                       onClick={() => this.sortBy("timeStamp", true)}
//                     >
//                       Recently added
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div
//               className="content-results__wrapper"
//               style={
//                 currentNumOfColumns <= 3
//                   ? {
//                       gridTemplateColumns: "repeat(auto-fit, minmax(300px, 350px))"
//                     }
//                   : {
//                       gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"
//                     }
//               }
//             >
//               {this.renderContent(this.state.activeSection)}
//             </div>
//           </>
//         )}
//       </div>
//     )
//   }
// }

// export default MoviesContent
// MoviesContent.contextType = AppContext

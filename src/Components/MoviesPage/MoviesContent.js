import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoMovies from "Components/Placeholders/PlaceholderNoMovies"
import PlaceholderLoadingContentResultsItem from "Components/Placeholders/PlaceholderLoadingSortBy/PlaceholderLoadingContentResultsItem"

const moviesToLoad = 5

class MoviesContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "watchLaterMovies",
      sortBy: "title",
      initialLoading: false,
      loadingContent: false,
      sortByLoading: false,
      database: {
        watchLaterMovies: []
      },
      disableLoad: {
        watchLaterMovies: false
      },
      lastLoadedMovie: {
        watchLaterMovies: moviesToLoad
      },
      loadedMovies: {
        watchLaterMovies: moviesToLoad
      }
    }
  }

  componentDidMount() {
    this.getContent({ sortBy: "title", isInitialLoad: true })
    window.addEventListener("scroll", this.handleScroll)

    this._isMounted = true
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll)

    this._isMounted = false
  }

  getContent = ({ sortBy = "title", isInitialLoad = true }) => {
    if (this.props.authUser === null) return
    if (isInitialLoad) {
      this.setState({ initialLoading: true })
    }

    const promises = []

    Object.keys(this.state.database).forEach(database => {
      const promise = this.props.firebase[database](this.props.authUser.uid)
        .orderByChild(sortBy)
        .limitToFirst(this.state.loadedMovies[database])
        .once("value", snapshot => {
          if (!this._isMounted) return

          let movies = []
          snapshot.forEach(item => {
            movies = [...movies, item.val()]
          })

          this.setState({
            database: {
              ...this.state.database,
              [database]: movies
            },
            lastLoadedMovie: {
              ...this.state.lastLoadedMovie,
              [database]: movies.length !== 0 && movies[movies.length - 1][sortBy]
            }
          })
        })

      promises.push(promise)
    })

    Promise.all(promises).then(() =>
      this.setState({
        sortByLoading: false,
        initialLoading: false
      })
    )
  }

  loadNewContent = ({ itemsToLoad = moviesToLoad }) => {
    if (this.props.authUser === null) return
    if (
      this.state.disableLoad[this.state.activeSection] ||
      this.state.loadingContent ||
      document.body.scrollHeight < 1400
    )
      return

    this.setState({
      loadingContent: true
    })

    this.props.firebase[this.state.activeSection](this.props.authUser.uid)
      .orderByChild(this.state.sortBy)
      .startAt(this.state.lastLoadedMovie[this.state.activeSection] + 1)
      .limitToFirst(itemsToLoad)
      .once("value", snapshot => {
        if (!this._isMounted) return

        let movies = []
        snapshot.forEach(item => {
          movies = [...movies, item.val()]
        })

        this.setState(prevState => ({
          database: {
            ...prevState.database,
            [this.state.activeSection]: [...prevState.database[this.state.activeSection], ...movies]
          },
          disableLoad: {
            ...prevState.disableLoad,
            [this.state.activeSection]: movies.length === 0
          },
          lastLoadedMovie: {
            ...prevState.lastLoadedMovie,
            [this.state.activeSection]: movies.length !== 0 && movies[movies.length - 1][this.state.sortBy]
          },
          loadedMovies: {
            ...prevState.loadedMovies,
            [this.state.activeSection]: prevState.database[this.state.activeSection].length + movies.length
          },
          loadingContent: false
        }))
      })
  }

  handleScroll = throttle(500, () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100) {
      this.loadNewContent({ itemsToLoad: moviesToLoad })
    }
  })

  handleMoviesOnClient = movieId => {
    const filteredMovies = this.state.database[this.state.activeSection].filter(item => item.id !== movieId)

    this.setState({
      database: {
        ...this.state.database,
        [this.state.activeSection]: filteredMovies
      }
    })
  }

  updateWatchLaterMoviesDatabase = () => {
    const activeSectionSavedState = this.state.database[this.state.activeSection]
    const watchLaterMoviesSavedState = this.state.database.watchLaterMovies

    this.props.firebase
      .watchLaterMovies(this.props.authUser.uid)
      .orderByChild(this.state.sortBy)
      .limitToFirst(this.state.loadedShows.watchLaterMovies + 1)
      .once("value", snapshot => {
        let watchLaterMovies = []
        snapshot.forEach(item => {
          watchLaterMovies = [...watchLaterMovies, item.val()]
        })

        this.setState(prevState => ({
          database: {
            ...this.state.database,
            watchLaterMovies
          },
          lastLoadedShow: {
            ...this.state.lastLoadedShow,
            watchLaterMovies:
              watchLaterMovies.length !== 0 &&
              watchLaterMovies[watchLaterMovies.length - 1][this.state.sortBy]
          },
          loadedShows: {
            ...prevState.loadedShows,
            watchLaterMovies: watchLaterMovies.length
          }
        }))
      })

    if (this.props.userContent.errorInDatabase.error) {
      this.setState({
        database: {
          ...this.state.database,
          [this.state.activeSection]: activeSectionSavedState,
          watchLaterMovies: watchLaterMoviesSavedState
        }
      })
    }
  }

  sortBy = sortBy => {
    if (this.state.sortBy === sortBy) return

    this.setState({ sortBy, sortByLoading: true })
    this.getContent({ sortBy, isInitialLoad: false })
  }

  renderContent = () => {
    const movies = this.props.authUser ? this.state.database.watchLaterMovies : this.context.watchLaterMovies

    return (
      <>
        {movies.map(item => {
          const filteredGenres = item.genre_ids.map(genreId =>
            listOfGenres.filter(item => item.id === genreId)
          )

          const contentTitle = item.title || item.original_title

          // Movies //
          let movie
          let urlMovieTitle
          let movieHash1080p
          let movieHash720p

          if (this.props.moviesArr) {
            movie = this.props.moviesArr.find(movie => movie.id === item.id)
          }

          if (movie) {
            const hash1080p = movie.torrents.find(item => item.quality === "1080p")
            movieHash1080p = hash1080p && hash1080p.hash

            const hash720p = movie.torrents.find(item => item.quality === "720p")
            movieHash720p = hash720p && hash720p.hash

            urlMovieTitle = movie.title.split(" ").join("+")
          }
          // Movies end //
          return (
            <div key={item.id} className="content-results__item  content-results__item--movies">
              {this.state.sortByLoading ? (
                <PlaceholderLoadingContentResultsItem delayAnimation="0.5s" />
              ) : (
                <div className="content-results__item--movies-wrapper">
                  <Link
                    to={{
                      pathname: `/movie/${item.id}`,
                      state: { logoDisable: true, y: 300 }
                    }}
                  >
                    <div className="content-results__item-main-info">
                      <div className="content-results__item-title">
                        {!contentTitle ? "No title available" : contentTitle}
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
                      {filteredGenres.map(item => (
                        <span key={item[0].id}>{item[0].name}</span>
                      ))}
                    </div>
                    <div className="content-results__item-overview">
                      <div className="content-results__item-poster">
                        <div
                          style={
                            item.backdrop_path !== null
                              ? {
                                  backgroundImage: `url(https://image.tmdb.org/t/p/w500/${item.backdrop_path ||
                                    item.poster_path})`
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
                    {!this.props.moviesIds.includes(item.id) ? (
                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          this.props.getMovieLinks(item.id, false, item.original_title, item.release_date)
                        }
                      >
                        Show Links
                      </button>
                    ) : this.props.loadingIds.includes(item.id) && !this.props.error.includes(item.id) ? (
                      <div>
                        <Loader className="loader--small-pink" />
                      </div>
                    ) : (
                      this.props.loadingIds.includes(item.id) && (
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
                      if (this.props.authUser) {
                        this.props.toggleWatchLaterMovie({
                          id: item.id,
                          data: item,
                          userDatabase: "watchLaterMovies"
                        })
                        this.loadNewContent({ itemsToLoad: 1 })
                        this.handleMoviesOnClient(item.id)
                      } else {
                        this.context.toggleMovieLS({
                          id: item.id,
                          data: movies
                        })
                      }
                    }}
                    type="button"
                  />
                </div>
              )}
            </div>
          )
        })}
      </>
    )
  }

  render() {
    const movies = this.props.authUser ? this.state.database.watchLaterMovies : this.context.watchLaterMovies
    const maxColumns = 4
    const currentNumOfColumns = movies.length <= maxColumns - 1 ? movies.length : maxColumns

    return (
      <div className="content-results">
        {this.state.initialLoading ? (
          <Loader className="loader--pink" />
        ) : movies.length === 0 ? (
          <PlaceholderNoMovies
            section={this.state.activeSection}
            authUser={this.props.authUser}
            activeSection={this.state.activeSection}
          />
        ) : (
          <>
            {this.props.authUser && (
              <div className="content-results__sortby">
                <div className="content-results__sortby-text">Sort by:</div>
                <div className="content-results__sortby-buttons">
                  <div
                    className={classNames("content-results__sortby-buttons", {
                      "content-results__sortby-button--active": this.state.sortBy === "title"
                    })}
                  >
                    <button
                      type="button"
                      className="button button--sortby-shows"
                      onClick={() => this.sortBy("title", true)}
                    >
                      Alphabetically
                    </button>
                  </div>
                  <div
                    className={classNames("content-results__sortby-button", {
                      "content-results__sortby-button--active": this.state.sortBy === "timeStamp"
                    })}
                  >
                    <button
                      type="button"
                      className="button button--sortby-shows"
                      onClick={() => this.sortBy("timeStamp", true)}
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
              {this.state.initialLoading ? (
                <Loader className="loader--pink" />
              ) : (
                <>
                  {this.renderContent(this.state.activeSection)}
                  {this.state.loadingContent && <Loader className="loader--pink loader--new-page" />}
                </>
              )}
            </div>
          </>
        )}
      </div>
    )
  }
}

export default withUserContent(MoviesContent)

MoviesContent.contextType = UserContentLocalStorageContext

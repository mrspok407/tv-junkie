import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import { throttle } from "throttle-debounce"
import classNames from "classnames"
import AppContextConsumer from "Components/AppContext/AppContextConsumer"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoMovies from "Components/Placeholders/PlaceholderNoMovies"
import PlaceholderLoadingContentResultsItem from "Components/Placeholders/PlaceholderLoadingSortBy/PlaceholderLoadingContentResultsItem"
import { compose } from "recompose"

const MOVIES_TO_LOAD_INITIAL = 15
const SCROLL_THRESHOLD = 800

class MoviesContent extends Component {
  state = {
    activeSection: "watchLaterMovies",
    sortBy: "title",
    disableLoad: {
      watchLaterMovies: false,
      watchLaterMoviesLS: false
    },
    loadedMovies: {
      watchLaterMovies: MOVIES_TO_LOAD_INITIAL,
      watchLaterMoviesLS: MOVIES_TO_LOAD_INITIAL
    }
  }

  componentDidMount() {
    this._isMounted = true
    window.addEventListener("scroll", this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll)

    this._isMounted = false
  }

  loadNewContent = () => {
    if (this.state.disableLoad[this.state.activeSection]) return

    this.setState({
      loadedMovies: {
        ...this.state.loadedMovies,
        [this.state.activeSection]: this.state.loadedMovies[this.state.activeSection] + MOVIES_TO_LOAD_INITIAL
      },
      disableLoad: {
        ...this.state.disableLoad,
        [this.state.activeSection]:
          this.state.loadedMovies[this.state.activeSection] >=
            this.props.context.userContent.userMovies.filter(
              movie => movie.database === this.state.activeSection
            ).length && true
      }
    })
  }

  loadNewContentLS = () => {
    if (this.state.disableLoad.watchLaterMoviesLS || this.props.firebase.authUser === null) return

    this.setState({
      loadedMovies: {
        ...this.state.loadedMovies,
        watchLaterMoviesLS: this.state.loadedMovies.watchLaterMoviesLS + MOVIES_TO_LOAD_INITIAL
      },
      disableLoad: {
        ...this.state.disableLoad,
        watchLaterMoviesLS:
          this.state.loadedMovies.watchLaterMoviesLS >=
            this.props.context.userContentLocalStorage.watchLaterMovies.length && true
      }
    })
  }

  sortBy = sortBy => {
    if (this.state.sortBy === sortBy) return

    this.setState({ sortBy })
  }

  handleScroll = throttle(500, () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - SCROLL_THRESHOLD) {
      console.log(this.state.disableLoad)
      this.loadNewContent()
      this.loadNewContentLS()
    }
  })

  renderContent = section => {
    const content = this.props.context.userContent.userMovies
      .sort((a, b) =>
        a[this.state.sortBy] > b[this.state.sortBy]
          ? this.state.sortBy === "timeStamp"
            ? -1
            : 1
          : this.state.sortBy !== "timeStamp"
          ? -1
          : 1
      )
      .slice(0, this.state.loadedMovies[section])

    const movies = this.props.authUser
      ? content
      : this.props.context.userContentLocalStorage.watchLaterMovies.slice(
          0,
          this.state.loadedMovies.watchLaterMoviesLS
        )

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
                        this.props.handleMovieInDatabases({
                          id: item.id,
                          data: item,
                          userDatabase: "watchLaterMovies"
                        })
                        this.props.context.userContent.handleUserMoviesOnClient({ id: item.id })
                      } else {
                        this.props.context.userContentLocalStorage.toggleMovieLS({
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
    const movies = this.props.authUser
      ? this.props.context.userContent.userMovies
      : this.props.context.userContentLocalStorage.watchLaterMovies
    const maxColumns = 4
    const currentNumOfColumns = movies.length <= maxColumns - 1 ? movies.length : maxColumns

    const loadingMovies = this.props.authUser ? this.props.context.userContent.loadingMovies : false

    return (
      <div className="content-results">
        {loadingMovies ? (
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
              {this.renderContent(this.state.activeSection)}
            </div>
          </>
        )}
      </div>
    )
  }
}

export default compose(withUserContent, AppContextConsumer)(MoviesContent)

// MoviesContent.contextType = UserContentLocalStorageContext
// MoviesContent.contextType = AppContext

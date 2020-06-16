import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import { UserContentLocalStorageContext } from "Components/UserContent/UserContentLocalStorageContext"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoMovies from "Components/Placeholders/PlaceholderNoMovies"

class MoviesContent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      watchLaterMovies: [],
      loadingContent: false
    }
  }

  componentDidMount() {
    this.getContent()
  }

  componentWillUnmount() {
    this.props.firebase.watchLaterMovies(this.props.authUser.uid).off()
  }

  showLinksToAll() {
    const watchLaterMovies = this.props.authUser ? this.state.watchLaterMovies : this.context.watchLaterMovies
    const showAllLinksPressed = true

    watchLaterMovies.map(item =>
      this.props.getMovieLinks(item.id, showAllLinksPressed, item.original_title, item.release_date)
    )
  }

  getContent = () => {
    if (this.props.authUser === null) return
    this.setState({ loadingContent: true })

    this.props.firebase
      .watchLaterMovies(this.props.authUser.uid)
      .limitToFirst(20)
      .on("value", snapshot => {
        const watchLaterMovies = snapshot.val()
          ? Object.keys(snapshot.val()).map(key => ({
              ...snapshot.val()[key]
            }))
          : []

        this.setState({
          watchLaterMovies,
          loadingContent: false
        })
      })
  }

  renderContent = () => {
    const watchLaterMovies = this.props.authUser ? this.state.watchLaterMovies : this.context.watchLaterMovies

    console.log(watchLaterMovies)

    return (
      <>
        {watchLaterMovies.map(item => {
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
            <div key={item.id} className="content-results__item">
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
                    this.props.toggleWatchLaterMovie(item.id, watchLaterMovies, item)
                  } else {
                    this.context.toggleContentLS(item.id, "watchLaterMovies", watchLaterMovies)
                  }
                }}
                type="button"
              />
            </div>
          )
        })}
      </>
    )
  }

  render() {
    const watchLaterMovies = this.props.authUser ? this.state.watchLaterMovies : this.context.watchLaterMovies
    const maxColumns = 4
    const currentNumOfColumns =
      watchLaterMovies.length <= maxColumns - 1 ? watchLaterMovies.length : maxColumns

    return (
      <div className="content-results">
        {watchLaterMovies.length !== 0 && (
          <div className="content-results__button-top">
            <button className="button" type="button" onClick={() => this.showLinksToAll()}>
              Show Links To All
            </button>
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
          {this.state.loadingContent ? (
            <Loader className="loader--pink" />
          ) : watchLaterMovies.length === 0 ? (
            <PlaceholderNoMovies />
          ) : (
            this.renderContent()
          )}
        </div>
      </div>
    )
  }
}

export default withUserContent(MoviesContent)

MoviesContent.contextType = UserContentLocalStorageContext

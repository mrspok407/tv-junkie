import React, { Component } from "react"
import { Link } from "react-router-dom"
import { withUserContent } from "Components/UserContent"
import { listOfGenres } from "Utils"
import Loader from "Components/Placeholders/Loader"
import PlaceholderNoMovies from "Components/Placeholders/PlaceholderNoMovies"
import "./MoviesPage.scss"

class MoviesContent extends Component {
  showLinksToAll() {
    const showAllLinksPressed = true

    this.props.userContent.watchLaterMovies.map(item =>
      this.props.getMovieLinks(item.id, showAllLinksPressed, item.original_title, item.release_date)
    )
  }

  renderContent = () => {
    const content = this.props.userContent.watchLaterMovies

    return (
      <>
        {content.map(
          ({
            title,
            original_title,
            id,
            release_date,
            vote_average,
            genre_ids = [],
            overview = "",
            backdrop_path,
            poster_path,
            vote_count
          }) => {
            const filteredGenres = genre_ids.map(genreId => listOfGenres.filter(item => item.id === genreId))

            const contentTitle = title || original_title

            // Movies //
            let movie
            let urlMovieTitle
            let movieHash1080p
            let movieHash720p

            if (this.props.moviesArr) {
              movie = this.props.moviesArr.find(item => item.id === id)
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
              <div key={id} className="content-results__item">
                <Link
                  to={{
                    pathname: `/movie/${id}`,
                    state: { logoDisable: true }
                  }}
                >
                  <div className="content-results__item-main-info">
                    <div className="content-results__item-title">
                      {!contentTitle ? "No title available" : contentTitle}
                    </div>
                    <div className="content-results__item-year">
                      {!release_date ? "" : `(${release_date.slice(0, 4)})`}
                    </div>
                    {vote_average !== 0 && (
                      <div className="content-results__item-rating">
                        {vote_average}
                        <span>/10</span>
                        <span className="content-results__item-rating-vote-count">({vote_count})</span>
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
                          backdrop_path !== null
                            ? {
                                backgroundImage: `url(https://image.tmdb.org/t/p/w500/${backdrop_path ||
                                  poster_path})`
                              }
                            : {
                                backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                              }
                        }
                      />
                    </div>
                    <div className="content-results__item-description">
                      {overview.length > 150 ? `${overview.substring(0, 150)}...` : overview}
                    </div>
                  </div>
                </Link>

                <div className="content-results__item-links">
                  {!this.props.moviesIds.includes(id) ? (
                    <button
                      type="button"
                      className="button"
                      onClick={() => this.props.getMovieLinks(id, false, original_title, release_date)}
                    >
                      Show Links
                    </button>
                  ) : this.props.loadingIds.includes(id) && !this.props.error.includes(id) ? (
                    <div>
                      <Loader className="loader--small-pink" />
                    </div>
                  ) : (
                    this.props.loadingIds.includes(id) && (
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
                  onClick={() =>
                    this.props.userContent.toggleWatchLaterMovie(id, this.props.userContent.watchLaterMovies)
                  }
                  type="button"
                />
              </div>
            )
          }
        )}
      </>
    )
  }

  render() {
    const watchLaterMovies = this.props.userContent.watchLaterMovies
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
          {watchLaterMovies.length === 0 ? <PlaceholderNoMovies /> : this.renderContent()}
        </div>
      </div>
    )
  }
}

export default withUserContent(MoviesContent)

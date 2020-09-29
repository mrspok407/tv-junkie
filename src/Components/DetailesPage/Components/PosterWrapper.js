import React, { Component } from "react"
import axios, { CancelToken } from "axios"
import Loader from "Components/Placeholders/Loader"

let cancelRequest

export default class PosterWrapper extends Component {
  constructor(props) {
    super(props)

    this.state = {
      movieTitle: "",
      movieHash1080p: "",
      movieHash720p: "",
      movieAvailable: true,
      loadingTorrentLinks: false,
      error: ""
    }
  }

  componentDidMount() {
    this._isMounted = true
    if (this.props.mediaType === "movie") {
      this.getMovieTorrents()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    if (cancelRequest !== undefined) {
      cancelRequest()
    }
  }

  getMovieTorrents = () => {
    this.setState({
      loadingTorrentLinks: true
    })
    axios
      .get(`https://yts.mx/api/v2/list_movies.json?query_term=${this.props.imdbId}`, {
        cancelToken: new CancelToken(function executor(c) {
          cancelRequest = c
        })
      })
      .then(res => {
        if (!res.data.data.hasOwnProperty("movies")) {
          this.setState({
            movieAvailable: false
          })
          return
        }

        const movie = res.data.data.movies[0]
        const movieHash1080p = movie.torrents.find(item => item.quality === "1080p")

        const movieHash720p = movie.torrents.find(item => item.quality === "720p")

        if (this._isMounted) {
          this.setState({
            movieTitle: movie.title,
            movieHash1080p: movieHash1080p && movieHash1080p.hash,
            movieHash720p: movieHash720p && movieHash720p.hash,
            movieAvailable: true,
            loadingTorrentLinks: false
          })
        }
      })
      .catch(err => {
        if (axios.isCancel(err)) return
        if (this._isMounted) {
          this.setState({
            error: "Something went wrong, sorry"
          })
        }
      })
  }

  render() {
    return (
      <div className="detailes-page__poster-wrapper">
        <div
          className="detailes-page__poster"
          style={
            this.props.poster
              ? {
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500/${this.props.poster})`
                }
              : {
                  backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                }
          }
        />
        {this.props.posterMobile && (
          <div
            className="detailes-page__poster detailes-page__poster--mobile"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/w500/${this.props.posterMobile})`
            }}
          />
        )}

        {this.props.mediaType === "movie" &&
        new Date(this.props.releaseDate).getTime() < this.props.todayDate.getTime() &&
        this.state.movieAvailable ? (
          <div className="detailes-page__movie-links">
            {!this.state.loadingTorrentLinks ? (
              <div className="torrent-links">
                {this.state.movieHash1080p && (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`magnet:?xt=urn:btih:${this.state.movieHash1080p}&dn=${this.state.movieTitle}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                  >
                    1080p
                  </a>
                )}
                {this.state.movieHash720p && (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`magnet:?xt=urn:btih:${this.state.movieHash720p}&dn=${this.state.movieTitle}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                  >
                    720p
                  </a>
                )}
              </div>
            ) : (
              <Loader className="loader--small-pink" />
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    )
  }
}

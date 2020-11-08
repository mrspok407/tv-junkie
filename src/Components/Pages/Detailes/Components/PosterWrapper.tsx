import React, { Component } from "react"
import axios from "axios"
import { todayDate } from "Utils"
import Loader from "Components/UI/Placeholders/Loader"
import { Detailes } from "../Detailes"

const { CancelToken } = require("axios")
let cancelRequest: any

type Props = {
  detailes: Detailes
  mediaType: string
}

type State = {
  movieTitle: string
  movieHash1080p?: string
  movieHash720p?: string
  movieAvailable: boolean
  loadingTorrentLinks: boolean
  error: string
}

interface APIData {
  data: {
    movies: { torrents: { hash: string }[]; title: string }[]
  }
}

export default class PosterWrapper extends Component<Props, State> {
  _isMounted = false

  state: State = {
    movieTitle: "",
    movieHash1080p: "",
    movieHash720p: "",
    movieAvailable: true,
    loadingTorrentLinks: false,
    error: ""
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
      .get<APIData>(`https://yts.mx/api/v2/list_movies.json?query_term=${this.props.detailes.imdb_id}`, {
        cancelToken: new CancelToken(function executor(c: any) {
          cancelRequest = c
        })
      })
      .then(({ data }) => {
        if (!data.data.hasOwnProperty("movies")) {
          this.setState({
            movieAvailable: false
          })
          return
        }

        const movie = data.data.movies[0]
        const movieHash1080p = movie.torrents.find((item: any) => item.quality === "1080p")

        const movieHash720p = movie.torrents.find((item: any) => item.quality === "720p")

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
      .catch((err) => {
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
            this.props.detailes.poster_path
              ? {
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500/${this.props.detailes.poster_path})`
                }
              : {
                  backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                }
          }
        />
        {this.props.detailes.backdrop_path && (
          <div
            className="detailes-page__poster detailes-page__poster--mobile"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/w500/${this.props.detailes.backdrop_path})`
            }}
          />
        )}

        {this.props.mediaType === "movie" &&
        new Date(this.props.detailes.release_date).getTime() < todayDate.getTime() &&
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

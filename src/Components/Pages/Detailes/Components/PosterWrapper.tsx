import React, { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { todayDate } from "Utils"
import Loader from "Components/UI/Placeholders/Loader"
import { ContentDetailes } from "Utils/Interfaces/ContentDetails"

const { CancelToken } = require("axios")
let cancelRequest: any

type Props = {
  detailes: ContentDetailes
  mediaType: string
}

interface APIData {
  data: {
    movies: { torrents: { hash: string; quality: string }[]; title: string }[]
  }
}

const PosterWrapper = React.memo<Props>(({ detailes, mediaType }) => {
  const [movieTitle, setMovieTitle] = useState("")
  const [movieHash1080p, setMovieHash1080p] = useState("")
  const [movieHash720p, setMovieHash720p] = useState("")
  const [movieAvailable, setMovieAvailable] = useState(true)
  const [loadingTorrentLinks, setLoadingTorrentLinks] = useState(false)
  const [error, setError] = useState("")

  const getMovieTorrents = useCallback(() => {
    setLoadingTorrentLinks(true)
    axios
      .get<APIData>(`https://yts.mx/api/v2/list_movies.json?query_term=${detailes.imdb_id}`, {
        cancelToken: new CancelToken(function executor(c: any) {
          cancelRequest = c
        })
      })
      .then(({ data }) => {
        if (!data.data.hasOwnProperty("movies")) {
          setMovieAvailable(false)
          return
        }

        const movie = data.data.movies[0]
        const movieHash1080p = movie.torrents.find((item) => item.quality === "1080p") || { hash: "" }

        const movieHash720p = movie.torrents.find((item) => item.quality === "720p") || { hash: "" }

        setMovieTitle(movie.title)
        setMovieHash1080p(movieHash1080p.hash)
        setMovieHash720p(movieHash720p.hash)
        setMovieAvailable(true)
        setLoadingTorrentLinks(false)
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        setError("Something went wrong, sorry")
      })
  }, [detailes])

  useEffect(() => {
    console.log("Poster Wrapper updated")
  })

  useEffect(() => {
    if (mediaType === "movie") {
      getMovieTorrents()
    }
    return () => {
      if (cancelRequest !== undefined) {
        cancelRequest()
      }
    }
  }, [mediaType, getMovieTorrents])

  return (
    <div className="detailes-page__poster-wrapper">
      <div
        className="detailes-page__poster"
        style={
          detailes.poster_path
            ? {
                backgroundImage: `url(https://image.tmdb.org/t/p/w500/${detailes.poster_path})`
              }
            : {
                backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
              }
        }
      />
      {detailes.backdrop_path && (
        <div
          className="detailes-page__poster detailes-page__poster--mobile"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w500/${detailes.backdrop_path})`
          }}
        />
      )}

      {mediaType === "movie" &&
      new Date(detailes.release_date).getTime() < todayDate.getTime() &&
      movieAvailable ? (
        <div className="detailes-page__movie-links">
          {!loadingTorrentLinks ? (
            <div className="torrent-links">
              {movieHash1080p && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`magnet:?xt=urn:btih:${movieHash1080p}&dn=${movieTitle}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                >
                  1080p
                </a>
              )}
              {movieHash720p && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`magnet:?xt=urn:btih:${movieHash720p}&dn=${movieTitle}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                >
                  720p
                </a>
              )}
            </div>
          ) : (
            <Loader className="loader--small-pink" />
          )}
        </div>
      ) : error ? (
        error
      ) : (
        ""
      )}
    </div>
  )
})

export default PosterWrapper

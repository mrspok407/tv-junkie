/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/self-closing-comp */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useContext } from "react"
import axios from "axios"
import { SelectedContentContext } from "../../Context/SelectedContentContext"
import { API_KEY } from "../../../Utils"
import "./FullContentInfo.scss"
import PlaceholderLoadingFullInfo from "../../Placeholders/PlaceholderLoadingFullInfo"
import Header from "../../Header/Header"
import Loader from "../../Placeholders/Loader"

const todayDate = new Date()

export default function FullContentInfo({
  match: {
    params: { id, mediaType }
  }
}) {
  const [options, setOptions] = useState({
    poster: "",
    title: "",
    releaseDate: "",
    lastAirDate: "",
    runtime: "",
    status: "",
    genres: [],
    network: "",
    productionCompany: "",
    rating: "",
    description: "",
    numberOfSeasons: "",
    seasonsArr: [],
    tagline: "",
    budget: ""
  })

  const [loading, setLoading] = useState(true)

  const [infoToPass, setInfoToPass] = useState([])

  const [movieTorrents, setMovieTorrents] = useState({
    title: "",
    hash1080p: "",
    hash720p: ""
  })

  const [tvShowEpisodes, setTvShowEpisodes] = useState([])
  const [openSeasons, setOpenSeasons] = useState([])
  const [loadingEpisodesIds, setLoadingEpisodesIds] = useState([])

  const [error, setError] = useState()

  const { selectedContent, toggleContent } = useContext(SelectedContentContext)

  useEffect(() => {
    if (mediaType === "show") {
      getFullShowInfo()
    } else if (mediaType === "movie") {
      getFullMovieInfo()
    }
  }, [mediaType])

  const getFullShowInfo = () => {
    setLoading(true)

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
      )
      .then(
        ({
          data,
          data: {
            original_name,
            first_air_date,
            vote_average,
            genres,
            overview,
            backdrop_path,
            poster_path,
            vote_count,
            episode_run_time,
            status,
            networks,
            last_air_date,
            number_of_seasons,
            seasons
          }
        }) => {
          const genreIds =
            genres && genres.length ? genres.map(item => item.id) : "-"
          const genreNames =
            genres && genres.length
              ? genres.map(item => item.name).join(", ")
              : "-"
          const networkNames =
            networks && networks.length
              ? networks.map(item => item.name).join(", ")
              : "-"

          setInfoToPass([
            {
              original_name,
              id: data.id,
              first_air_date,
              vote_average,
              genre_ids: genreIds,
              overview,
              backdrop_path,
              poster_path,
              vote_count
            }
          ])

          setOptions({
            poster: poster_path,
            title: original_name || "-",
            releaseDate: first_air_date || "-",
            lastAirDate: last_air_date || "-",
            runtime: episode_run_time[0] || "-",
            status: status || "-",
            genres: genreNames || "-",
            network: networkNames || "-",
            rating: vote_average || "-",
            description: overview || "-",
            numberOfSeasons: number_of_seasons || "-",
            seasonsArr: seasons
          })
          setLoading(false)
        }
      )
      .catch(() => {
        setError("Something went wrong, sorry")
      })
  }

  const showSeasonsEpisode = (seasonId, seasonNum) => {
    if (openSeasons.includes(seasonId)) {
      setOpenSeasons(prevState => [
        ...prevState.filter(item => item !== seasonId)
      ])
    } else {
      setOpenSeasons(prevState => [...prevState, seasonId])
    }

    if (tvShowEpisodes.some(item => item.seasonId === seasonId)) return

    setLoadingEpisodesIds(prevState => [...prevState, seasonId])

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}?api_key=c5e3186413780c3aeec39b0767a6ec99&language=en-US`
      )
      .then(({ data: { episodes } }) => {
        setTvShowEpisodes(prevState => [...prevState, { seasonId, episodes }])
        setLoadingEpisodesIds(prevState => [
          ...prevState.filter(item => item !== seasonId)
        ])
      })
  }

  const getFullMovieInfo = () => {
    setLoading(true)
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
      )
      .then(
        ({
          data,
          data: {
            poster_path,
            backdrop_path,
            original_title,
            release_date,
            runtime,
            status,
            genres,
            production_companies,
            vote_average,
            vote_count,
            overview,
            tagline,
            budget
          }
        }) => {
          const movieGenres = genres.map(item => item.name).join(", ")
          const genresIds = genres.map(item => item.id)
          const yearRelease = release_date.slice(0, 4)

          const prodComp =
            production_companies.length === 0 || !production_companies
              ? "-"
              : production_companies[0].name

          setInfoToPass([
            {
              original_title,
              id: data.id,
              release_date,
              vote_average,
              genre_ids: genresIds,
              overview,
              backdrop_path,
              poster_path,
              vote_count
            }
          ])

          setOptions({
            poster: poster_path,
            title: original_title || "-",
            releaseDate: release_date || "-",
            runtime: runtime || "-",
            status: status || "-",
            genres: movieGenres || "-",
            productionCompany: prodComp,
            rating: vote_average || "-",
            description: overview || "-",
            tagline: tagline || "-",
            budget: budget || "-"
          })

          setLoading(false)

          return axios.get(
            `https://yts.mx/api/v2/list_movies.json?query_term=${original_title} ${yearRelease}`
          )
        }
      )
      .then(res => {
        if (!res.data.data.hasOwnProperty("movies")) return
        const movie = res.data.data.movies[0]
        const movieHash1080p = movie.torrents.find(
          item => item.quality === "1080p"
        ).hash

        const movieHash720p = movie.torrents.find(
          item => item.quality === "720p"
        ).hash

        setMovieTorrents({
          title: movie.title,
          hash1080p: movieHash1080p,
          hash720p: movieHash720p
        })
      })
      .catch(() => {
        setError("Something went wrong, sorry")
      })
  }

  const {
    poster,
    title,
    releaseDate,
    lastAirDate,
    runtime,
    status,
    genres,
    network,
    productionCompany,
    rating,
    description,
    tagline,
    budget,
    numberOfSeasons,
    seasonsArr
  } = options

  const yearRelease = releaseDate.slice(0, 4)
  const yearEnded = mediaType === "show" && lastAirDate.slice(0, 4)

  const yearReleaseAsDateObj = new Date(releaseDate)

  const yearRange =
    status !== "Ended"
      ? `${yearRelease} - ...`
      : `${yearRelease} - ${yearEnded}`

  const formatedBudget =
    budget !== 0 && budget !== "-" ? (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      })
        .format(budget)
        .slice(0, -3)
        .split(",")
        .join(".")
    ) : (
      <span className="full-detailes__info-no-info">-</span>
    )

  return (
    <>
      <Header isLogoVisible={false} />
      <div className="full-detailes-container">
        {error ? (
          <span style={{ textAlign: "center", width: "100%" }}>{error}</span>
        ) : !loading ? (
          <div className="full-detailes">
            <div
              className={
                mediaType === "show"
                  ? "full-detailes__poster-wrapper"
                  : "full-detailes__poster-wrapper full-detailes__poster-wrapper--movie"
              }
            >
              <div
                className="full-detailes__poster"
                style={
                  mediaType === "show"
                    ? {
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster})`
                      }
                    : mediaType === "movie"
                    ? {
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster})`
                      }
                    : {
                        backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                      }
                }
              />
              {mediaType === "movie" &&
              yearReleaseAsDateObj.getTime() < todayDate.getTime() ? (
                <div className="full-detailes__links">
                  <div className="full-detailes__links-torrents">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`magnet:?xt=urn:btih:${movieTorrents.hash1080p}&dn=${movieTorrents.title}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                    >
                      1080p
                    </a>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`magnet:?xt=urn:btih:${movieTorrents.hash720p}&dn=${movieTorrents.title}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                    >
                      720p
                    </a>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="full-detailes__info">
              <div className="full-detailes__info-title">
                {title}
                <span>
                  {mediaType === "show" && yearRelease !== "-"
                    ? ` (${yearRange})`
                    : ""}
                </span>
              </div>
              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Year</div>
                <div className="full-detailes__info-value">
                  {yearRelease !== "-" ? (
                    `${yearRelease}`
                  ) : (
                    <span className="full-detailes__info-no-info">
                      {yearRelease}
                    </span>
                  )}
                </div>
              </div>
              {status !== "Released" && (
                <div className="full-detailes__info-row">
                  <div className="full-detailes__info-option">Status</div>
                  <div className="full-detailes__info-value">{status}</div>
                </div>
              )}

              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Genres</div>
                <div className="full-detailes__info-value">{genres}</div>
              </div>
              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Company</div>
                <div className="full-detailes__info-value">
                  {mediaType === "show"
                    ? network
                    : mediaType === "movie" &&
                      (productionCompany !== "-" ? (
                        productionCompany
                      ) : (
                        <span className="full-detailes__info-no-info">-</span>
                      ))}
                </div>
              </div>
              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Rating</div>
                <div className="full-detailes__info-value">
                  {rating !== "-" ? (
                    rating
                  ) : (
                    <span className="full-detailes__info-no-info">
                      {rating}
                    </span>
                  )}
                </div>
              </div>
              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Runtime</div>
                <div className="full-detailes__info-value">
                  {runtime !== "-" ? (
                    `${runtime} min`
                  ) : (
                    <span className="full-detailes__info-no-info">
                      {runtime}
                    </span>
                  )}
                </div>
              </div>
              {mediaType === "movie" && (
                <>
                  <div className="full-detailes__info-row">
                    <div className="full-detailes__info-option">Tagline</div>
                    <div className="full-detailes__info-value">
                      {tagline !== "-" ? (
                        `${tagline}`
                      ) : (
                        <span className="full-detailes__info-no-info">
                          {tagline}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="full-detailes__info-row">
                    <div className="full-detailes__info-option">Budget</div>
                    <div className="full-detailes__info-value">
                      {formatedBudget}
                    </div>
                  </div>
                </>
              )}

              <div className="full-detailes__info-row full-detailes__info--button">
                {selectedContent.some(e => e.id === Number(id)) ? (
                  <button
                    className="button button--searchlist button--pressed"
                    onClick={() => toggleContent(Number(id), infoToPass)}
                    type="button"
                  >
                    Remove {mediaType === "movie" ? "movie" : "show"}
                  </button>
                ) : (
                  <button
                    className="button button--searchlist"
                    onClick={() => toggleContent(Number(id), infoToPass)}
                    type="button"
                  >
                    Add {mediaType === "movie" ? "movie" : "show"}
                  </button>
                )}
              </div>
            </div>
            <div className="full-detailes__info-description">{description}</div>
            <div className="full-detailes__info-seasons-and-episodes">
              {mediaType === "show" &&
                seasonsArr.map(item => {
                  if (item.season_number === 0 || item.name === "Specials")
                    return
                  const seasonId = item.id
                  console.log(loadingEpisodesIds)

                  return (
                    <div key={seasonId} className="full-detailes__info-season">
                      <div
                        className="full-detailes__info-season-number"
                        onClick={() =>
                          showSeasonsEpisode(seasonId, item.season_number)
                        }
                      >
                        Season {item.season_number}
                      </div>

                      {openSeasons.includes(seasonId) &&
                        (!loadingEpisodesIds.includes(seasonId) ? (
                          <div className="full-detailes__info-episodes">
                            {tvShowEpisodes.map(season => {
                              if (season.seasonId !== seasonId) return

                              return season.episodes.map(episode => (
                                <div
                                  key={episode.id}
                                  className="full-detailes__info-episode"
                                >
                                  <div>{episode.name}</div>
                                </div>
                              ))
                            })}
                          </div>
                        ) : (
                          <div className="full-detailes__info-episodes">
                            <div className="full-detailes__info-episode">
                              <Loader className="loader--show-links" />
                            </div>
                          </div>
                        ))}
                    </div>
                  )
                })}
            </div>
          </div>
        ) : (
          <PlaceholderLoadingFullInfo delayAnimation="0.4s" />
        )}
      </div>
    </>
  )
}

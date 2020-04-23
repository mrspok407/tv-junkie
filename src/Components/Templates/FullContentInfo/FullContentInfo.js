/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/self-closing-comp */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useContext } from "react"
import { useLocation } from "react-router-dom"
import axios from "axios"
import { SelectedContentContext } from "../../Context/SelectedContentContext"
import PlaceholderLoadingFullInfo from "../../Placeholders/PlaceholderLoadingFullInfo"
import ScrollToTop from "../../../Utils/ScrollToTop"
import Header from "../../Header/Header"
import Loader from "../../Placeholders/Loader"
import { API_KEY, differenceBtwDatesInDays } from "../../../Utils"
import "./FullContentInfo.scss"

const todayDate = new Date()

export default function FullContentInfo({
  match: {
    params: { id, mediaType }
  }
}) {
  const [options, setOptions] = useState({
    poster: "",
    posterMobile: "",
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
  const [detailEpisodeInfo, setDetailEpisodeInfo] = useState([])

  const [error, setError] = useState()
  const [errorShowEpisodes, setErrorShowEpisodes] = useState()

  const { selectedContent, toggleContent } = useContext(SelectedContentContext)

  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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
            posterMobile: backdrop_path,
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
            seasonsArr: seasons.reverse()
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
        // console.log(episodes)
        const episodesReverese = episodes.reverse()
        // console.log(episodesReverese)
        setTvShowEpisodes(prevState => [
          ...prevState,
          { seasonId, episodes: episodesReverese }
        ])
        setLoadingEpisodesIds(prevState => [
          ...prevState.filter(item => item !== seasonId)
        ])
        setErrorShowEpisodes("")
      })
      .catch(() => {
        setErrorShowEpisodes("Something went wrong, sorry")
        setLoadingEpisodesIds([])
      })
  }

  const showEpisodeInfo = episodeId => {
    if (detailEpisodeInfo.includes(episodeId)) {
      setDetailEpisodeInfo(prevState => [
        ...prevState.filter(item => item !== episodeId)
      ])
    } else {
      setDetailEpisodeInfo(prevState => [...prevState, episodeId])
    }
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
            posterMobile: backdrop_path,
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
    posterMobile,
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

  const urlShowTitle = title.split(" ").join("+")

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
                  poster
                    ? {
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster})`
                      }
                    : {
                        backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                      }
                }
              />
              {posterMobile && (
                <div
                  className="full-detailes__poster full-detailes__poster--mobile"
                  style={{
                    backgroundImage: `url(https://image.tmdb.org/t/p/w500/${posterMobile})`
                  }}
                />
              )}

              {mediaType === "movie" &&
              yearReleaseAsDateObj.getTime() < todayDate.getTime() ? (
                <div className="full-detailes__links">
                  <div className="torrent-links">
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
                seasonsArr.map(season => {
                  if (
                    season.season_number === 0 ||
                    season.name === "Specials" ||
                    !season.air_date
                  )
                    return
                  const seasonId = season.id

                  const daysToNewSeason = differenceBtwDatesInDays(
                    season.air_date,
                    todayDate
                  )

                  return (
                    <div
                      key={seasonId}
                      className={
                        !season.poster_path
                          ? "full-detailes__info-season full-detailes__info-season--no-poster"
                          : "full-detailes__info-season"
                      }
                    >
                      <div
                        className={
                          !openSeasons.includes(seasonId)
                            ? "full-detailes__info-season-info"
                            : "full-detailes__info-season-info full-detailes__info-season-info--open"
                        }
                        style={
                          daysToNewSeason > 0
                            ? {
                                backgroundColor: "rgba(132, 90, 90, 0.3)"
                              }
                            : {
                                backgroundColor: "#1d1d1d96"
                              }
                        }
                        onClick={() =>
                          showSeasonsEpisode(seasonId, season.season_number)
                        }
                      >
                        <div className="full-detailes__info-season-number">
                          Season {season.season_number}
                          {daysToNewSeason > 0 && (
                            <span className="full-detailes__info-season-when-new-season">
                              {daysToNewSeason} days to air
                            </span>
                          )}
                        </div>
                        <div className="full-detailes__info-season-date">
                          {season.air_date && season.air_date.slice(0, 4)}
                        </div>
                      </div>

                      {openSeasons.includes(seasonId) &&
                        (!loadingEpisodesIds.includes(seasonId) ? (
                          <>
                            {season.poster_path && (
                              <div
                                className="full-detailes__info-season-poster"
                                style={{
                                  backgroundImage: `url(https://image.tmdb.org/t/p/w500/${season.poster_path})`
                                }}
                              />
                            )}

                            <div className="full-detailes__info-episodes">
                              {tvShowEpisodes.map(item => {
                                if (item.seasonId !== seasonId) return

                                return item.episodes.map(episode => {
                                  // if (!episode.air_date) return
                                  // Format Date //
                                  const airDateISO = new Date(
                                    episode.air_date
                                  ).toISOString()

                                  const optionss = {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                  }

                                  const formatedDate = new Date(airDateISO)

                                  const episodeAirDate = episode.air_date
                                    ? new Intl.DateTimeFormat(
                                        "en-US",
                                        optionss
                                      ).format(formatedDate)
                                    : "No date available"
                                  // Format Date End //

                                  // Format Seasons And Episode Numbers //
                                  const seasonToString = season.season_number.toString()
                                  const episodeToString = episode.episode_number.toString()

                                  const seasonNumber =
                                    seasonToString.length === 1
                                      ? "s0".concat(seasonToString)
                                      : "s".concat(seasonToString)
                                  const episodeNumber =
                                    episodeToString.length === 1
                                      ? "e0".concat(episodeToString)
                                      : "e".concat(episodeToString)
                                  // Format Seasons And Episode Numbers End //

                                  const episodeAirDateAsDateObj = new Date(
                                    episode.air_date
                                  )

                                  const daysToNewEpisode = differenceBtwDatesInDays(
                                    episode.air_date,
                                    todayDate
                                  )

                                  return (
                                    <div
                                      key={episode.id}
                                      className={
                                        !detailEpisodeInfo.includes(episode.id)
                                          ? "full-detailes__info-episode"
                                          : "full-detailes__info-episode full-detailes__info-episode--open"
                                      }
                                    >
                                      <div
                                        className="full-detailes__info-episode-wrapper"
                                        onClick={() =>
                                          showEpisodeInfo(episode.id)
                                        }
                                        style={
                                          daysToNewEpisode > 0 ||
                                          !episode.air_date
                                            ? {
                                                backgroundColor:
                                                  "rgba(132, 90, 90, 0.3)"
                                              }
                                            : {
                                                backgroundColor: "#1d1d1d96"
                                              }
                                        }
                                      >
                                        <div className="full-detailes__info-episode-date">
                                          {episodeAirDate}
                                        </div>
                                        <div className="full-detailes__info-episode-name">
                                          <span className="full-detailes__info-episode-number">
                                            {episode.episode_number}.
                                          </span>
                                          {episode.name}
                                        </div>
                                        {daysToNewEpisode > 0 && (
                                          <div className="full-detailes__info-episode-when-new-episode">
                                            {daysToNewEpisode} days
                                          </div>
                                        )}
                                      </div>

                                      {detailEpisodeInfo.includes(
                                        episode.id
                                      ) && (
                                        <div
                                          className={
                                            episode.still_path
                                              ? "full-detailes__info-episode-detailes"
                                              : "full-detailes__info-episode-detailes full-detailes__info-episode-detailes--no-image"
                                          }
                                        >
                                          {episode.still_path && (
                                            <div
                                              className="full-detailes__info-episode-detailes-image"
                                              style={{
                                                backgroundImage: `url(https://image.tmdb.org/t/p/w500${episode.still_path})`
                                              }}
                                            ></div>
                                          )}
                                          {episode.overview && (
                                            <div className="full-detailes__info-episode-detailes-overview">
                                              {episode.overview}
                                            </div>
                                          )}

                                          {episodeAirDateAsDateObj <
                                            todayDate.getTime() &&
                                            episode.air_date && (
                                              <div className="torrent-links torrent-links--full-content-info">
                                                <a
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${seasonNumber}${episodeNumber}+1080p&cat=41`}
                                                >
                                                  1080p
                                                </a>
                                                <a
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${seasonNumber}${episodeNumber}+720p&cat=41`}
                                                >
                                                  720p
                                                </a>
                                                <a
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  href={`https://www.ettvdl.com/torrents-search.php?search=${urlShowTitle}+${seasonNumber}${episodeNumber}&cat=5`}
                                                >
                                                  480p
                                                </a>
                                              </div>
                                            )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })
                              })}
                            </div>
                          </>
                        ) : (
                          <div className="full-detailes__info-episodes full-detailes__info-episodes--loading">
                            <div className="full-detailes__info-episode full-detailes__info-episode--loading">
                              {!errorShowEpisodes ? (
                                <Loader className="loader--show-links loader--show-links-detailes" />
                              ) : (
                                <div>{errorShowEpisodes}</div>
                              )}
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
      <ScrollToTop />
    </>
  )
}

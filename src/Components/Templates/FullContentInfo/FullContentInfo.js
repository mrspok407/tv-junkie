/* eslint-disable no-prototype-builtins */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable array-callback-return */
import React, { useState, useEffect, useContext } from "react"
import axios, { CancelToken } from "axios"
import { useHistory } from "react-router-dom"
import { combineMergeObjects } from "Utils"
import { withUserContent } from "Components/UserContent"
import { Helmet } from "react-helmet"
import { releasedEpisodesModifier } from "Utils"
import merge from "deepmerge"
import PlaceholderLoadingFullInfo from "Components/Placeholders/PlaceholderLoadingFullInfo/PlaceholderLoadingFullInfo"
import ScrollToTop from "Utils/ScrollToTop"
import Header from "Components/Header/Header"
import Slider from "Utils/Slider/Slider"
import MainInfo from "./Components/MainInfo"
import ShowsEpisodes from "Components/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import PosterWrapper from "./Components/PosterWrapper"
import * as ROUTES from "Utils/Constants/routes"
import ScrollToTopOnUpdate from "Utils/ScrollToTopOnUpdate"
import "./FullContentInfo.scss"
import Footer from "Components/Footer/Footer"
import { AppContext } from "Components/AppContext/AppContextHOC"

const todayDate = new Date()

let cancelRequest

function FullContentInfo({
  match: {
    params: { id, mediaType }
  },
  firebase,
  authUser
}) {
  const [detailes, setDetailes] = useState({
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
    budget: "",
    imdbId: ""
  })

  const [similarContent, setSimilarContent] = useState([])

  const [loadingPage, setLoadingPage] = useState(true)

  const [showInDatabase, setShowInDatabase] = useState({
    info: null,
    episodes: null,
    releasedEpisodes: null
  })
  const [showDatabaseOnClient, setShowDatabaseOnClient] = useState(null)

  const [movieInDatabase, setMovieInDatabase] = useState(null)

  const [infoToPass, setInfoToPass] = useState({})

  const [error, setError] = useState()

  const [isMounted, setIsMounted] = useState(true)

  const history = useHistory()

  const context = useContext(AppContext)

  useEffect(() => {
    setIsMounted(true)

    if (mediaType === "show") {
      getFullShowInfo()
    }
    if (mediaType === "movie") {
      getFullMovieInfo()
    }

    return () => {
      setIsMounted(false)
      if (cancelRequest !== undefined) cancelRequest()
      if (!authUser) return

      firebase.userShowEpisodes(authUser.uid, Number(id)).off()
      firebase.showEpisodes(detailes.status, Number(id)).off()

      setShowInDatabase({ info: null, episodes: null, releasedEpisodes: null })
      setMovieInDatabase(null)
      setShowDatabaseOnClient(null)
    }
  }, [mediaType, id])

  useEffect(() => {
    if (mediaType === "show") {
      getShowInDatabase()
    }

    if (mediaType === "movie") {
      getMovieInDatabase()
    }
  }, [context, id])

  useEffect(() => {
    mergeEpisodesFromDatabase({ numberOfSeasons: detailes.numberOfSeasons })
  }, [detailes, id])

  const getFullShowInfo = () => {
    setLoadingPage(true)

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&append_to_response=similar`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(
        ({
          data: {
            id,
            name,
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
            seasons,
            similar
          }
        }) => {
          const genreIds = genres && genres.length ? genres.map(item => item.id) : "-"
          const genreNames = genres && genres.length ? genres.map(item => item.name).join(", ") : "-"
          const networkNames = networks && networks.length ? networks.map(item => item.name).join(", ") : "-"

          const similarShows = similar.results.filter(item => item.poster_path)
          const similarShowsSortByVotes = similarShows.sort((a, b) => b.vote_count - a.vote_count)

          setInfoToPass({
            name,
            original_name,
            id: id,
            first_air_date,
            vote_average,
            genre_ids: genreIds,
            overview,
            backdrop_path,
            poster_path,
            vote_count,
            status
          })

          setDetailes({
            ...detailes,
            poster: poster_path,
            posterMobile: backdrop_path,
            title: name || original_name || "-",
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

          // mergeEpisodesFromDatabase({ numberOfSeasons: number_of_seasons })
          handleListeners({ status })

          setSimilarContent(similarShowsSortByVotes)
          // setLoadingPage(false)
        }
      )
      .catch(err => {
        if (axios.isCancel(err)) return
        if (err.response.status === 404) {
          history.push(ROUTES.PAGE_DOESNT_EXISTS)
          return
        }

        setError("Something went wrong, sorry")
        setLoadingPage(false)
      })
  }

  const getFullMovieInfo = () => {
    setLoadingPage(true)
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&append_to_response=similar_movies`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(
        ({
          data: {
            id,
            poster_path,
            backdrop_path,
            original_title,
            title,
            release_date,
            runtime,
            status,
            genres,
            production_companies,
            vote_average,
            vote_count,
            overview,
            tagline,
            budget,
            imdb_id,
            similar_movies
          }
        }) => {
          const movieGenres = genres.map(item => item.name).join(", ")
          const genresIds = genres.map(item => item.id)

          const prodComp =
            production_companies.length === 0 || !production_companies ? "-" : production_companies[0].name

          const similarMovies = similar_movies.results.filter(item => item.poster_path)
          const similarMoviesSortByVotes = similarMovies.sort((a, b) => b.vote_count - a.vote_count)

          setInfoToPass({
            title,
            original_title,
            id: id,
            release_date,
            vote_average,
            genre_ids: genresIds,
            overview,
            backdrop_path,
            poster_path,
            vote_count
          })

          setDetailes({
            ...detailes,
            poster: poster_path,
            posterMobile: backdrop_path,
            title: title || original_title || "-",
            releaseDate: release_date || "-",
            runtime: runtime || "-",
            status: status || "-",
            genres: movieGenres || "-",
            productionCompany: prodComp,
            rating: vote_average || "-",
            description: overview || "-",
            tagline: tagline || "-",
            budget: budget || "-",
            imdbId: imdb_id || ""
          })

          setSimilarContent(similarMoviesSortByVotes)
          setLoadingPage(false)
        }
      )
      .catch(err => {
        if (axios.isCancel(err)) return
        if (err.response.status === 404) {
          history.push(ROUTES.PAGE_DOESNT_EXISTS)
          return
        }

        setError("Something went wrong, sorry")
        setLoadingPage(false)
      })
  }

  const mergeEpisodesFromDatabase = ({ numberOfSeasons }) => {
    if (!authUser || !detailes.numberOfSeasons) return

    const status = detailes.status === "Ended" || detailes.status === "Canceled" ? "ended" : "ongoing"

    firebase
      .allShowsList(status)
      .child(Number(id))
      .once("value", snapshot => {
        if (snapshot.val() === null) return

        const maxSeasonsInChunk = 20
        const allSeasons = []
        const seasonChunks = []
        const apiRequests = []

        for (let i = 1; i <= numberOfSeasons; i += 1) {
          allSeasons.push(`season/${i}`)
        }

        for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
          const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
          seasonChunks.push(chunk.join())
        }

        seasonChunks.forEach(item => {
          const request = axios.get(
            `https://api.themoviedb.org/3/tv/${Number(id)}?api_key=${
              process.env.REACT_APP_TMDB_API
            }&append_to_response=${item}`
          )
          apiRequests.push(request)
        })

        axios
          .all([...apiRequests])
          .then(
            axios.spread((...responses) => {
              const rowData = []
              const seasonsData = []

              responses.forEach(item => {
                rowData.push(item.data)
              })

              const mergedRowData = Object.assign({}, ...rowData)

              Object.entries(mergedRowData).forEach(([key, value]) => {
                if (!key.indexOf("season/")) {
                  seasonsData.push({ [key]: { ...value } })
                }
              })

              const allEpisodes = []

              seasonsData.forEach((data, index) => {
                const season = data[`season/${index + 1}`]
                if (!Array.isArray(season.episodes) || season.episodes.length === 0) return

                const episodes = []

                season.episodes.forEach(item => {
                  const updatedEpisode = {
                    air_date: item.air_date,
                    episode_number: item.episode_number,
                    name: item.name,
                    season_number: item.season_number,
                    id: item.id
                  }
                  episodes.push(updatedEpisode)
                })

                const updatedSeason = {
                  air_date: season.air_date,
                  season_number: season.season_number,
                  id: season._id,
                  poster_path: season.poster_path,
                  name: season.name,
                  episodes
                }

                allEpisodes.push(updatedSeason)
              })

              const dataToPass = {
                episodes: allEpisodes,
                status: mergedRowData.status
              }

              return dataToPass
            })
          )
          .then(data => {
            firebase
              .allShowsList(status)
              .child(Number(id))
              .update({ episodes: data.episodes })
              .catch(err => {
                console.log(err)
              })

            firebase.userShowAllEpisodes(authUser.uid, Number(id)).once("value", snapshot => {
              if (snapshot.val() === null) return

              const userEpisodes = snapshot.val()

              const databaseEpisodes = data.episodes

              let updatedSeasons = []
              let updatedSeasonsUser = []

              databaseEpisodes.forEach((season, indexSeason) => {
                const seasonPath = userEpisodes[indexSeason]
                const databaseEpisodes = season.episodes
                const episodes = seasonPath ? userEpisodes[indexSeason].episodes : []

                const mergedEpisodes = merge(databaseEpisodes, episodes, {
                  arrayMerge: combineMergeObjects
                })

                const updatedEpisodesUser = mergedEpisodes.reduce((acc, episode) => {
                  acc.push({ watched: episode.watched || false, userRating: episode.userRating || 0 })
                  return acc
                }, [])

                const updatedSeason = {
                  ...season,
                  episodes: mergedEpisodes
                }

                const updatedSeasonUser = {
                  season_number: season.season_number,
                  episodes: updatedEpisodesUser,
                  userRating: (seasonPath && seasonPath.userRating) || 0
                }

                updatedSeasons.push(updatedSeason)
                updatedSeasonsUser.push(updatedSeasonUser)
              })

              firebase.userShowAllEpisodes(authUser.uid, Number(id)).set(updatedSeasonsUser)
            })
          })
      })
  }

  const handleListeners = ({ status }) => {
    if (!authUser) return

    const statusDatabase = status === "Ended" || status === "Canceled" ? "ended" : "ongoing"

    console.log("handleListeners")

    firebase.showEpisodes(statusDatabase, Number(id)).on("value", snapshot => {
      if (snapshot.val() === null) {
        setLoadingPage(false)
        return
      }

      const episodesFullData = snapshot.val()

      const releasedEpisodes = releasedEpisodesModifier({ data: snapshot.val() })

      console.log(releasedEpisodes)

      firebase.userShowEpisodes(authUser.uid, Number(id)).on("value", snapshot => {
        console.log(snapshot.val())
        if (snapshot.val() === null) {
          setLoadingPage(false)
          return
        }

        const userEpisodes = snapshot.val().episodes

        const allEpisodes = userEpisodes.reduce((acc, item) => {
          acc.push(...item.episodes)
          return acc
        }, [])

        allEpisodes.splice(releasedEpisodes.length)

        const episodesAirDate = merge(episodesFullData, userEpisodes, {
          arrayMerge: combineMergeObjects
        }).reduce((acc, season) => {
          const episodes = season.episodes.reduce((acc, episode) => {
            acc.push({ air_date: episode.air_date, userRating: episode.userRating, watched: episode.watched })
            return acc
          }, [])
          acc.push({ season_number: season.season_number, userRating: season.userRating, episodes })
          return acc
        }, [])

        const allEpisodesWatched = !allEpisodes.some(episode => !episode.watched)
        const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

        firebase.userShowAllEpisodesInfo(authUser.uid, Number(id)).update({
          allEpisodesWatched,
          finished
        })

        firebase.userShow({ uid: authUser.uid, key: Number(id) }).update({ finished, allEpisodesWatched })

        firebase
          .userShowAllEpisodesNotFinished(authUser.uid, Number(id))
          .set(
            allEpisodesWatched || snapshot.val().info.database !== "watchingShows" ? null : episodesAirDate
          )

        setShowInDatabase(prevState => ({
          ...prevState,
          episodes: userEpisodes,
          releasedEpisodes
        }))
        setLoadingPage(false)
      })
    })
  }

  const getShowInDatabase = () => {
    const show = context.userContent.userShows.find(show => show.id === Number(id))

    if (!authUser || !show) return

    if (isMounted) {
      setShowInDatabase(prevState => ({
        ...prevState,
        info: show
      }))
      setShowDatabaseOnClient(show.database)
    }
  }

  const changeShowDatabaseOnClient = database => {
    setShowDatabaseOnClient(database)
  }

  const getMovieInDatabase = () => {
    const movie = context.userContent.userMovies.find(movie => movie.id === Number(id))

    if (!authUser || !movie) {
      setMovieInDatabase(null)
    }

    if (isMounted) {
      console.log(movie)
      setMovieInDatabase(movie)
    }
  }

  return (
    <>
      <Helmet>
        <title>
          {detailes.title} {detailes.releaseDate !== "-" ? `(${detailes.releaseDate.slice(0, 4)})` : ""} | TV
          Junkie
        </title>
      </Helmet>
      <Header isLogoVisible={false} />

      <div className="full-detailes-container">
        {error ? (
          <div className="full-detailes__error">
            <h1>{error}</h1>
          </div>
        ) : !loadingPage && !context.userContent.loadingShows ? (
          <div className="full-detailes">
            <PosterWrapper
              poster={detailes.poster}
              posterMobile={detailes.posterMobile}
              imdbId={detailes.imdbId}
              releaseDate={detailes.releaseDate}
              todayDate={todayDate}
              mediaType={mediaType}
            />

            <MainInfo
              detailes={detailes}
              mediaType={mediaType}
              id={id}
              infoToPass={infoToPass}
              showInDatabase={showInDatabase}
              getShowInDatabase={getShowInDatabase}
              changeShowDatabaseOnClient={changeShowDatabaseOnClient}
              showDatabaseOnClient={showDatabaseOnClient}
              movieInDatabase={movieInDatabase}
            />

            <div className="full-detailes__description">{detailes.description}</div>

            {mediaType === "show" && (
              <>
                <ShowsEpisodes
                  fullContentPage={true}
                  seasonsArr={detailes.seasonsArr}
                  showTitle={detailes.title}
                  todayDate={todayDate}
                  id={id}
                  showInDatabase={showInDatabase}
                  showDatabaseOnClient={showDatabaseOnClient}
                />
              </>
            )}
            {similarContent.length > 0 && (
              <div className="full-detailes__slider">
                <div className="full-detailes__slider-title">
                  {mediaType === "movie" ? "Similar movies" : "Similar shows"}
                </div>

                <Slider listOfContent={similarContent} />
              </div>
            )}
          </div>
        ) : (
          <PlaceholderLoadingFullInfo delayAnimation="0.4s" />
        )}
      </div>
      <Footer />
      <ScrollToTop />
      <ScrollToTopOnUpdate />
    </>
  )
}

export default withUserContent(FullContentInfo, "FullContentInfo")

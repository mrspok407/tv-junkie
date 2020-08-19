/* eslint-disable no-prototype-builtins */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useState, useEffect } from "react"
import axios, { CancelToken } from "axios"
import { useHistory } from "react-router-dom"
import { combineMergeObjects } from "Utils"
import { withUserContent } from "Components/UserContent"
import { Helmet } from "react-helmet"
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

const todayDate = new Date()

let cancelRequest

function FullContentInfo({
  match: {
    params: { id, mediaType }
  },
  userContent,
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
  const [loadingFromDatabase, setLoadingFromDatabase] = useState(false)
  const [showInDatabase, setShowInDatabase] = useState({ database: null, info: null, episodes: null })
  const [showDatabaseOnClient, setShowDatabaseOnClient] = useState(null)

  const [movieInDatabase, setMovieInDatabase] = useState(null)
  const [movieDatabaseOnClient, setMovieDatabaseOnClient] = useState(null)

  const [infoToPass, setInfoToPass] = useState({})

  const [error, setError] = useState()

  const [isMounted, setIsMounted] = useState(true)

  const history = useHistory()

  useEffect(() => {
    setIsMounted(true)

    if (mediaType === "show") {
      getFullShowInfo()
      getShowInDatabase()
    }
    if (mediaType === "movie") {
      getFullMovieInfo()
      getMovieInDatabase()
    }

    return () => {
      setIsMounted(false)
      if (cancelRequest !== undefined) cancelRequest()
      if (!authUser) return

      userContent.showsDatabases.forEach(database => {
        firebase.userShow({ uid: authUser.uid, key: Number(id), database }).off()
      })

      firebase
        .watchLaterMovies(authUser.uid)
        .child(Number(id))
        .off()

      setShowInDatabase({ database: null, info: null })
      setMovieInDatabase(null)
      setShowDatabaseOnClient(null)
      setMovieDatabaseOnClient(null)
    }
  }, [mediaType, id])

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

          setSimilarContent(similarShowsSortByVotes)
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

  const getShowInDatabase = () => {
    if (!authUser) return
    setLoadingFromDatabase(true)

    let counter = 0

    userContent.showsDatabases.forEach(database => {
      counter++

      firebase.userShow({ uid: authUser.uid, key: Number(id), database }).on(
        "value",
        snapshot => {
          if (snapshot.val() !== null) {
            const userShow = snapshot.val()
            const showsSubDatabase = userShow.status

            firebase
              .showInDatabase(showsSubDatabase, Number(id))
              .once("value", snapshot => {
                const show = snapshot.val()

                let updatedSeasons = []
                let updatedSeasonsUser = []

                show.episodes.forEach((season, indexSeason) => {
                  const seasonPath = userShow.episodes[indexSeason]
                  const databaseEpisodes = season.episodes
                  const userEpisodes = seasonPath ? userShow.episodes[indexSeason].episodes : []

                  const mergedEpisodes = merge(databaseEpisodes, userEpisodes, {
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

                firebase.userShowAllEpisodes(authUser.uid, Number(id), database).set(updatedSeasonsUser)
              })
              .then(() => {
                if (counter === userContent.showsDatabases.length) {
                  setLoadingFromDatabase(false)
                }
              })

            if (userShow.allEpisodesWatched && showsSubDatabase === "ended") {
              firebase
                .userShows(authUser.uid, "finishedShows")
                .child(Number(id))
                .set({
                  id: userShow.id,
                  status: userShow.status,
                  finished_and_name: userShow.finished_and_name,
                  finished_and_timeStamp: userShow.finished_and_timeStamp
                })
            } else {
              firebase
                .userShows(authUser.uid, "finishedShows")
                .child(Number(id))
                .set(null)
            }

            if (isMounted) {
              setShowInDatabase({ database, info: userShow })
              setShowDatabaseOnClient(database)
            }
          } else {
            if (isMounted) {
              setLoadingFromDatabase(false)
            }
          }
        },
        error => {
          console.log(`Error in database occured. ${error}`)

          setShowDatabaseOnClient(showInDatabase.database)
        }
      )
    })
  }

  const changeShowDatabaseOnClient = database => {
    setShowDatabaseOnClient(database)
  }

  const getMovieInDatabase = () => {
    if (!authUser) return
    setLoadingFromDatabase(true)

    userContent.moviesDatabases.forEach(item => {
      firebase[item](authUser.uid)
        .child(Number(id))
        .on(
          "value",
          snapshot => {
            if (isMounted) {
              if (snapshot.val() !== null) {
                setMovieInDatabase(item)
              } else {
                setMovieInDatabase(null)
              }
              setLoadingFromDatabase(false)
            }
          },
          error => {
            console.log(`Error in database occured. ${error}`)

            setMovieDatabaseOnClient(movieInDatabase)
          }
        )
    })
  }

  useEffect(() => {
    setMovieDatabaseOnClient(movieInDatabase)
  }, [movieInDatabase])

  const changeMovieDatabaseOnClient = database => {
    if (movieDatabaseOnClient === "watchLaterMovies") {
      setMovieDatabaseOnClient(null)
    } else {
      setMovieDatabaseOnClient(database)
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
        ) : !loadingPage && !loadingFromDatabase ? (
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
              changeMovieDatabaseOnClient={changeMovieDatabaseOnClient}
              showDatabaseOnClient={showDatabaseOnClient}
              movieDatabaseOnClient={movieDatabaseOnClient}
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
                  infoToPass={infoToPass}
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

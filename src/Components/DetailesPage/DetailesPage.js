/* eslint-disable no-prototype-builtins */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable array-callback-return */
import React, { useState, useEffect, useContext } from "react"
import { useHistory } from "react-router-dom"
import axios, { CancelToken } from "axios"
import { Helmet } from "react-helmet"
import * as ROUTES from "Utils/Constants/routes"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { withUserContent } from "Components/UserContent"
import Header from "Components/Header/Header"
import Slider from "Utils/Slider/Slider"
import MainInfo from "./Components/MainInfo"
import ShowsEpisodes from "Components/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import PosterWrapper from "./Components/PosterWrapper"
import ScrollToTop from "Utils/ScrollToTopBar"
import ScrollToTopOnUpdate from "Utils/ScrollToTopOnUpdate"
import Footer from "Components/Footer/Footer"
import PlaceholderLoadingFullInfo from "Components/Placeholders/PlaceholderLoadingFullInfo/PlaceholderLoadingFullInfo"
import useMergeEpisodes from "./FirebaseHelpers/useMergeEpisodes"
import useHandleListeners from "./FirebaseHelpers/useHandleListeners"
import "./DetailesPage.scss"

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

  const [loadingAPIrequest, setLoadingAPIrequest] = useState(false)
  const [loadingEpisodeMerging, mergeEpisodes] = useMergeEpisodes({
    detailes,
    id: Number(id),
    authUser,
    firebase
  })

  const [showInfo, setShowInfo] = useState()

  const [
    loadingFirebaseListeners,
    episodesFromDatabase,
    releasedEpisodes,
    handleListeners
  ] = useHandleListeners({
    id: Number(id),
    authUser,
    firebase
  })

  const [showDatabaseOnClient, setShowDatabaseOnClient] = useState(null)

  const [movieInDatabase, setMovieInDatabase] = useState(null)

  const [error, setError] = useState()

  // const [isMounted, setIsMounted] = useState(true)

  const history = useHistory()

  const context = useContext(AppContext)

  useEffect(() => {
    // setIsMounted(true)
    getContent()

    return () => {
      // setIsMounted(false)
      if (cancelRequest !== undefined) cancelRequest()
      if (!authUser) return

      setShowInfo(null)

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
    mergeEpisodes()
  }, [detailes, id])

  const getContent = () => {
    setLoadingAPIrequest(true)

    axios
      .get(
        `https://api.themoviedb.org/3/${mediaType === "show" ? "tv" : "movie"}/${id}?api_key=${
          process.env.REACT_APP_TMDB_API
        }&language=en-US&append_to_response=${mediaType === "show" ? "similar" : "similar_movies"}`,
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
            original_title,
            title,
            first_air_date,
            release_date,
            vote_average,
            genres,
            overview,
            backdrop_path,
            poster_path,
            vote_count,
            episode_run_time,
            runtime,
            tagline,
            status,
            networks,
            production_companies,
            budget,
            last_air_date,
            number_of_seasons,
            imdb_id,
            seasons,
            similar,
            similar_movies
          }
        }) => {
          const genreIds = genres && genres.length ? genres.map(item => item.id) : "-"
          const genreNames = genres && genres.length ? genres.map(item => item.name).join(", ") : "-"
          const networkNames = networks && networks.length ? networks.map(item => item.name).join(", ") : "-"
          const prodComp =
            production_companies.length === 0 || !production_companies ? "-" : production_companies[0].name

          const similarType = similar || similar_movies
          const similarContent = similarType.results.filter(item => item.poster_path)
          const similarContentSortByVotes = similarContent.sort((a, b) => b.vote_count - a.vote_count)

          setDetailes({
            ...detailes,
            id: id,
            poster: poster_path,
            posterMobile: backdrop_path,
            title: name || original_name || title || original_title || "-",
            titleOriginal: original_name || original_title || "-",
            releaseDate: first_air_date || release_date || "-",
            lastAirDate: last_air_date || "-",
            runtime: episode_run_time || runtime || "-",
            status: status || "-",
            genres: genreNames || "-",
            genre_ids: genreIds,
            network: networkNames || "-",
            productionCompany: prodComp || "-",
            rating: vote_average || "-",
            voteCount: vote_count || "-",
            description: overview || "-",
            tagline: tagline || "-",
            budget: budget || "-",
            numberOfSeasons: number_of_seasons || "-",
            imdbId: imdb_id || "",
            seasonsArr: seasons && seasons.reverse()
          })

          if (mediaType === "show") {
            handleListeners(status)
          }

          setLoadingAPIrequest(false)
          setSimilarContent(similarContentSortByVotes)
        }
      )
      .catch(err => {
        if (axios.isCancel(err)) return
        if (err.response.status === 404) {
          history.push(ROUTES.PAGE_DOESNT_EXISTS)
          return
        }

        setError("Something went wrong, sorry")
        setLoadingAPIrequest(false)
      })
  }

  const getShowInDatabase = () => {
    const show = context.userContent.userShows.find(show => show.id === Number(id))

    if (!authUser || !show) return

    setShowInfo(show)
    setShowDatabaseOnClient(show.database)
  }

  const changeShowDatabaseOnClient = database => {
    setShowDatabaseOnClient(database)
  }

  const getMovieInDatabase = () => {
    const movie = context.userContent.userMovies.find(movie => movie.id === Number(id))

    setMovieInDatabase(!authUser || !movie ? null : movie)
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

      <div className="detailes-page-container">
        {error ? (
          <div className="detailes-page__error">
            <h1>{error}</h1>
          </div>
        ) : !loadingAPIrequest &&
          !loadingFirebaseListeners &&
          !loadingEpisodeMerging &&
          !context.userContent.loadingShows ? (
          <div className="detailes-page">
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
              showInfo={showInfo}
              changeShowDatabaseOnClient={changeShowDatabaseOnClient}
              showDatabaseOnClient={showDatabaseOnClient}
              movieInDatabase={movieInDatabase}
            />

            <div className="detailes-page__description">{detailes.description}</div>

            {mediaType === "show" && (
              <>
                <ShowsEpisodes
                  detailesPage={true}
                  seasonsArr={detailes.seasonsArr}
                  showTitle={detailes.title}
                  todayDate={todayDate}
                  id={id}
                  showInfo={showInfo}
                  episodesFromDatabase={episodesFromDatabase}
                  releasedEpisodes={releasedEpisodes}
                  showDatabaseOnClient={showDatabaseOnClient}
                />
              </>
            )}
            {similarContent.length > 0 && (
              <div className="detailes-page__slider">
                <div className="detailes-page__slider-title">
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

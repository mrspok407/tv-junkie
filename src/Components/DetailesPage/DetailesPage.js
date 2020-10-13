/* eslint-disable react-hooks/exhaustive-deps */
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
import mergeEpisodes from "./FirebaseHelpers/mergeEpisodes"
import useHandleListeners from "./FirebaseHelpers/useHandleListeners"
import "./DetailesPage.scss"

let cancelRequest

function DetailesPage({
  match: {
    params: { id, mediaType },
  },
  firebase,
  authUser,
}) {
  const [detailes, setDetailes] = useState()
  const [similarContent, setSimilarContent] = useState([])

  const [loadingAPIrequest, setLoadingAPIrequest] = useState(true)

  const [showInfo, setShowInfo] = useState()
  const [movieInDatabase, setMovieInDatabase] = useState(null)

  const [episodesFromDatabase, releasedEpisodes, handleListeners] = useHandleListeners({
    id: Number(id),
    authUser,
    firebase,
  })

  const [loadingFromDatabase, setLoadingFromDatabase] = useState(true)

  const [showDatabaseOnClient, setShowDatabaseOnClient] = useState(null)

  const [error, setError] = useState()

  const history = useHistory()

  const context = useContext(AppContext)

  useEffect(() => {
    getContent()

    return () => {
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

  const handleLoading = (isLoading) => {
    setLoadingFromDatabase(isLoading)
  }

  const getContent = () => {
    setLoadingAPIrequest(true)
    setLoadingFromDatabase(true)

    axios
      .get(
        `https://api.themoviedb.org/3/${mediaType === "show" ? "tv" : "movie"}/${id}?api_key=${
          process.env.REACT_APP_TMDB_API
        }&language=en-US&append_to_response=${mediaType === "show" ? "similar" : "similar_movies"}`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          }),
        }
      )
      .then(
        ({
          data: {
            id,
            name,
            original_name,
            title,
            original_title,
            first_air_date,
            last_air_date,
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
            number_of_seasons,
            imdb_id,
            seasons,
            similar,
            similar_movies,
          },
        }) => {
          const genreIds = genres && genres.length ? genres.map((item) => item.id) : "-"
          const genreNames = genres && genres.length ? genres.map((item) => item.name).join(", ") : "-"
          const networkNames =
            networks && networks.length ? networks.map((item) => item.name).join(", ") : "-"
          const prodComp =
            production_companies.length === 0 || !production_companies ? "-" : production_companies[0].name

          const similarType = similar || similar_movies
          const similarContent = similarType.results.filter((item) => item.poster_path)
          const similarContentSortByVotes = similarContent.sort((a, b) => b.vote_count - a.vote_count)

          setDetailes({
            ...detailes,
            id: id,
            poster_path: poster_path,
            backdrop_path: backdrop_path,
            name: name || original_name || "-",
            original_name: original_name || "-",
            title: title || original_title || "-",
            first_air_date: first_air_date || "-",
            release_date: release_date || "-",
            last_air_date: last_air_date || "-",
            episode_run_time: episode_run_time || "-",
            runtime: runtime || "-",
            status: status || "-",
            genres: genreNames || "-",
            genre_ids: genreIds,
            network: networkNames || "-",
            production_companies: prodComp || "-",
            vote_average: vote_average || "-",
            vote_count: vote_count || "-",
            overview: overview || "-",
            tagline: tagline || "-",
            budget: budget || "-",
            number_of_seasons: number_of_seasons || "-",
            imdb_id: imdb_id || "",
            seasonsArr: seasons ? seasons.reverse() : [],
          })

          if (mediaType === "show" && authUser) {
            mergeEpisodes({
              status,
              handleLoading,
              id: Number(id),
              authUser,
              firebase,
              context,
              callback: handleListeners,
            })
          }
          if (!authUser) {
            setLoadingFromDatabase(false)
          }

          setLoadingAPIrequest(false)
          setSimilarContent(similarContentSortByVotes)
        }
      )
      .catch((err) => {
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
    const show = context.userContent.userShows.find((show) => show.id === Number(id))

    if (!authUser || !show) return

    setShowInfo(show)
    setShowDatabaseOnClient(show.database)
  }

  const changeShowDatabaseOnClient = (database) => {
    setShowDatabaseOnClient(database)
  }

  const getMovieInDatabase = () => {
    const movie = context.userContent.userMovies.find((movie) => movie.id === Number(id))

    setMovieInDatabase(!authUser || !movie ? null : movie)
    setLoadingFromDatabase(false)
  }

  return (
    <>
      <Helmet>
        {detailes && (
          <title>
            {mediaType === "show"
              ? `
                ${detailes.name}
                ${
                  detailes.first_air_date !== "-" ? `(${detailes.first_air_date.slice(0, 4)})` : ""
                } | TV Junkie
              `
              : `
              ${detailes.title}
              ${detailes.release_date !== "-" ? `(${detailes.release_date.slice(0, 4)})` : ""} | TV Junkie
              `}
          </title>
        )}
      </Helmet>
      <Header isLogoVisible={false} />

      <div className="detailes-page-container">
        {error ? (
          <div className="detailes-page__error">
            <h1>{error}</h1>
          </div>
        ) : !loadingAPIrequest && !loadingFromDatabase && !context.userContent.loadingShows ? (
          <div className="detailes-page">
            <PosterWrapper
              poster_path={detailes.poster_path}
              backdrop_path={detailes.backdrop_path}
              imdb_id={detailes.imdb_id}
              release_date={detailes.release_date}
              first_air_date={detailes.first_air_date}
              mediaType={mediaType}
            />

            <MainInfo
              detailes={detailes}
              handleListeners={handleListeners}
              mediaType={mediaType}
              id={id}
              showInfo={showInfo}
              changeShowDatabaseOnClient={changeShowDatabaseOnClient}
              showDatabaseOnClient={showDatabaseOnClient}
              movieInDatabase={movieInDatabase}
            />

            <div className="detailes-page__description">{detailes.description}</div>

            {mediaType === "show" && (
              <ShowsEpisodes
                detailesPage={true}
                seasonsArr={detailes.seasonsArr}
                showTitle={detailes.name}
                id={id}
                showInfo={showInfo}
                episodesFromDatabase={episodesFromDatabase}
                releasedEpisodes={releasedEpisodes}
                showDatabaseOnClient={showDatabaseOnClient}
              />
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

export default withUserContent(DetailesPage)

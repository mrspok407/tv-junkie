/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react"
import { useHistory } from "react-router-dom"
import axios from "axios"
import { Helmet } from "react-helmet"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import * as ROUTES from "Utils/Constants/routes"
import * as _get from "lodash.get"
import Header from "Components/UI/Header/Header"
import Slider from "Utils/Slider/Slider"
import MainInfo from "./Components/MainInfo"
import ShowsEpisodes from "Components/UI/Templates/SeasonsAndEpisodes/ShowsEpisodes"
import PosterWrapper from "./Components/PosterWrapper"
import ScrollToTopBar from "Utils/ScrollToTopBar"
import ScrollToTopOnUpdate from "Utils/ScrollToTopOnUpdate"
import Footer from "Components/UI/Footer/Footer"
import PlaceholderLoadingFullInfo from "Components/UI/Placeholders/PlaceholderLoadingFullInfo/PlaceholderLoadingFullInfo"
import useHandleListeners from "./FirebaseHelpers/UseHandleListeners"
import { ContentDetailes, CONTENT_DETAILS_DEFAULT } from "Utils/Interfaces/ContentDetails"
import "./Detailes.scss"

const { CancelToken } = require("axios")
let cancelRequest: any

type Props = {
  match: { params: { id: string; mediaType: string } }
}

export interface ShowInfoInterface {
  status: string
  id: number
  database: string
  showInUserDatabase?: boolean
}
const SHOW_INFO_INITIAL_STATE = {
  status: "",
  id: 0,
  database: "",
  showInUserDatabase: false
}

export const DetailesPage: React.FC<Props> = ({
  match: {
    params: { id, mediaType }
  }
}) => {
  const [detailes, setDetailes] = useState<ContentDetailes>(CONTENT_DETAILS_DEFAULT)

  const history = useHistory()
  const context = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const { authUser } = context

  const { episodesFromDatabase, releasedEpisodes, handleListeners } = useHandleListeners({ id: Number(id) })

  const [similarContent, setSimilarContent] = useState<ContentDetailes[]>([])

  const [showInfo, setShowInfo] = useState<ShowInfoInterface>(SHOW_INFO_INITIAL_STATE)
  // const [showInUserDatabase, setShowInUserDatabase] = useState(false);
  const [movieInDatabase, setMovieInDatabase] = useState<ContentDetailes | null>(null)

  const [showDatabaseOnClient, setShowDatabaseOnClient] = useState<string>("")

  const [error, setError] = useState<string>()

  const [loadingAPIrequest, setLoadingAPIrequest] = useState(true)
  const [loadingFromDatabase, setLoadingFromDatabase] = useState(true)

  useEffect(() => {
    getContent()

    return () => {
      if (cancelRequest !== undefined) cancelRequest()

      setShowInfo(SHOW_INFO_INITIAL_STATE)
      setMovieInDatabase(null)
      setShowDatabaseOnClient("")

      firebase.userShowAllEpisodes(authUser && authUser.uid, id).off()
    }
  }, [mediaType, id])

  useEffect(() => {
    mediaType === "show" ? getShowInDatabase() : getMovieInDatabase()
  }, [context, id])

  useEffect(() => {
    if (!authUser || mediaType !== "show" || context.userContent.loadingShows || !detailes) {
      return
    }

    handleListeners({
      id: Number(id),
      status: detailes.status,
      handleLoading
    })
  }, [id, detailes, context.userContent.loadingShows])

  const handleLoading = (isLoading: boolean) => {
    setLoadingFromDatabase(isLoading)
  }

  const getContent = () => {
    setLoadingAPIrequest(true)
    setLoadingFromDatabase(true)

    axios
      .get<ContentDetailes>(
        `https://api.themoviedb.org/3/${mediaType === "show" ? "tv" : "movie"}/${id}?api_key=${
          process.env.REACT_APP_TMDB_API
        }&language=en-US&append_to_response=${mediaType === "show" ? "similar" : "similar_movies"}`,
        {
          cancelToken: new CancelToken(function executor(c: any) {
            cancelRequest = c
          })
        }
      )
      .then(({ data }) => {
        const genreIds = data.genres && data.genres.length ? data.genres.map((item: { id: number }) => item.id) : "-"
        const genreNames =
          data.genres && data.genres.length ? data.genres.map((item: { name: string }) => item.name).join(", ") : "-"
        const networkNames =
          data.networks && data.networks.length
            ? data.networks.map((item: { name: string }) => item.name).join(", ")
            : "-"
        const prodComp =
          data.production_companies.length === 0 || !data.production_companies ? "-" : data.production_companies[0].name

        const similarType: any = data.similar || data.similar_movies
        const similarContent = similarType.results.filter((item: { poster_path: string }) => item.poster_path)
        const similarContentSortByVotes = similarContent.sort(
          (a: { vote_count: number }, b: { vote_count: number }) => b.vote_count - a.vote_count
        )

        setDetailes({
          ...detailes,
          id: data.id,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          name: data.name || data.original_name || "-",
          original_name: data.original_name || "-",
          title: data.title || data.original_title || "-",
          first_air_date: data.first_air_date || "-",
          release_date: data.release_date || "-",
          last_air_date: data.last_air_date || "-",
          episode_run_time: data.episode_run_time || "-",
          runtime: data.runtime || "-",
          status: data.status || "-",
          genres: genreNames || "-",
          genre_ids: genreIds,
          networks: networkNames || "-",
          production_companies: prodComp || "-",
          vote_average: data.vote_average || "-",
          vote_count: data.vote_count || "-",
          overview: data.overview || "-",
          tagline: data.tagline || "-",
          budget: data.budget || 0,
          number_of_seasons: data.number_of_seasons || "-",
          imdb_id: data.imdb_id || "",
          seasonsFromAPI: data.seasons ? data.seasons.reverse() : []
        })

        if (!authUser) {
          setLoadingFromDatabase(false)
        }

        setLoadingAPIrequest(false)
        setSimilarContent(similarContentSortByVotes)
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        if (_get(err.response, "status", "") === 404) {
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

    setShowInfo({ ...show, showInUserDatabase: true })
    // setShowInUserDatabase(true)
    setShowDatabaseOnClient(show.database)
  }

  const changeShowDatabaseOnClient = (database: string) => {
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
                ${detailes.first_air_date !== "-" ? `(${detailes.first_air_date.slice(0, 4)})` : ""} | TV Junkie
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
            <PosterWrapper detailes={detailes} mediaType={mediaType} />

            <MainInfo
              detailes={detailes}
              mediaType={mediaType}
              id={Number(id)}
              changeShowDatabaseOnClient={changeShowDatabaseOnClient}
              showDatabaseOnClient={showDatabaseOnClient}
              movieInDatabase={movieInDatabase}
              handleListeners={handleListeners}
            />

            <div className="detailes-page__description">{detailes.overview}</div>

            {mediaType === "show" && (
              <ShowsEpisodes
                parentComponent="detailesPage"
                episodesData={detailes.seasonsFromAPI}
                showTitle={detailes.name}
                id={Number(id)}
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

                <Slider sliderData={similarContent} />
              </div>
            )}
          </div>
        ) : (
          <PlaceholderLoadingFullInfo delayAnimation="0.4s" />
        )}
      </div>
      <Footer />
      <ScrollToTopBar />
      <ScrollToTopOnUpdate />
    </>
  )
}

export default DetailesPage

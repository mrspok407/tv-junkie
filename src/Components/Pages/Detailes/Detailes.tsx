/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useCallback } from "react"
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
import { ContentDetailes, CONTENT_DETAILS_DEFAULT } from "Utils/Interfaces/ContentDetails"
import useGoogleRedirect from "Components/UserAuth/SignIn/UseGoogleRedirect"
import { useAppDispatch, useAppSelector } from "app/hooks"
import { selectShowsLoading } from "Components/UserContent/UseUserShowsRed/userShowsSliceRed"
import { fetchShowEpisodes } from "Components/UserContent/UseUserShowsRed/Middleware"
import "./Detailes.scss"
import useGetDataTMDB from "./Hooks/UseGetDataTMDB"

type Props = {
  match: { params: { id: string; mediaType: string } }
}

export const DetailesPage: React.FC<Props> = ({
  match: {
    params: { id, mediaType }
  }
}) => {
  const context = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const { authUser } = context
  const dispatch = useAppDispatch()

  const [detailes, loadingTMDB, similarContent, error] = useGetDataTMDB({ id, mediaType })
  const showsLoading = useAppSelector(selectShowsLoading)

  useGoogleRedirect()

  useEffect(() => {
    if (showsLoading || mediaType !== "show" || !authUser) return
    dispatch(fetchShowEpisodes(Number(id), authUser?.uid!, firebase))
  }, [id, mediaType, showsLoading, authUser, firebase])

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
        ) : !loadingTMDB && !showsLoading ? (
          <div className="detailes-page">
            <PosterWrapper detailes={detailes} mediaType={mediaType} />
            <MainInfo detailes={detailes} mediaType={mediaType} id={Number(id)} />

            <div className="detailes-page__description">{detailes.overview}</div>

            {mediaType === "show" && (
              <ShowsEpisodes
                parentComponent="detailesPage"
                episodesData={detailes.seasonsFromAPI}
                showTitle={detailes.name}
                id={Number(id)}
              />
            )}
            {similarContent.length && (
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

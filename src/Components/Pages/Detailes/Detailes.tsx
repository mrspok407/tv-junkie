/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { AppContext } from 'Components/AppContext/AppContextHOC'
import { FirebaseContext } from 'Components/Firebase'
import * as ROUTES from 'Utils/Constants/routes'
import * as _get from 'lodash.get'
import Header from 'Components/UI/Header/Header'
import Slider from 'Utils/Slider/Slider'
import ShowsEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/ShowsEpisodes'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import ScrollToTopOnUpdate from 'Utils/ScrollToTopOnUpdate'
import Footer from 'Components/UI/Footer/Footer'
import PlaceholderLoadingFullInfo from 'Components/UI/Placeholders/PlaceholderLoadingFullInfo/PlaceholderLoadingFullInfo'
import { ContentDetailes, CONTENT_DETAILS_DEFAULT } from 'Utils/Interfaces/ContentDetails'
import useGoogleRedirect from 'Components/UserAuth/SignIn/UseGoogleRedirect'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { selectShowsLoading } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { fetchShowEpisodes } from 'Components/UserContent/UseUserShowsRed/Middleware'
import PosterWrapper from './Components/PosterWrapper'
import { MainInfo } from './Components/MainInfo'
import useGetDataTMDB from './Hooks/UseGetDataTMDB'
import './Detailes.scss'
import useFrequentVariables from '../../../Utils/Hooks/UseFrequentVariables'

type Props = {
  match: { params: { id: string; mediaType: string } }
}

export const DetailesPage: React.FC<Props> = ({
  match: {
    params: { id, mediaType },
  },
}) => {
  const [detailes, loadingTMDB, similarContent, error] = useGetDataTMDB({ id, mediaType })
  const showsInitialLoading = useAppSelector(selectShowsLoading)

  console.log({ loadingTMDB })

  useGoogleRedirect()

  return (
    <>
      <Helmet>
        {detailes && (
          <title>
            {mediaType === 'show'
              ? `
                ${detailes.name}
                ${detailes.first_air_date !== '-' ? `(${detailes.first_air_date.slice(0, 4)})` : ''} | TV Junkie
              `
              : `
              ${detailes.title}
              ${detailes.release_date !== '-' ? `(${detailes.release_date.slice(0, 4)})` : ''} | TV Junkie
              `}
          </title>
        )}
      </Helmet>
      <Header isLogoVisible={false} />

      <div className="detailes-page-container">
        {error && (
          <div className="detailes-page__error">
            <h1>{error}</h1>
          </div>
        )}

        {!error && !loadingTMDB && !showsInitialLoading ? (
          <div className="detailes-page">
            <PosterWrapper detailes={detailes} mediaType={mediaType} />
            <MainInfo detailes={detailes} mediaType={mediaType} id={Number(id)} />

            <div className="detailes-page__description">{detailes.overview}</div>

            {mediaType === 'show' && (
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
                  {mediaType === 'movie' ? 'Similar movies' : 'Similar shows'}
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

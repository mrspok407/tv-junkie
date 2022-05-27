/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import { Helmet } from 'react-helmet'
import Header from 'Components/UI/Header/Header'
import Slider from 'Utils/Slider/Slider'
import ShowsEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/ShowsEpisodes'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import ScrollToTopOnUpdate from 'Utils/ScrollToTopOnUpdate'
import Footer from 'Components/UI/Footer/Footer'
import PlaceholderLoadingFullInfo from 'Components/UI/Placeholders/PlaceholderLoadingFullInfo/PlaceholderLoadingFullInfo'
import useGoogleRedirect from 'Components/UserAuth/SignIn/UseGoogleRedirect'
import { useAppSelector } from 'app/hooks'
import { selectShowsLoading } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import PosterWrapper from './Components/PosterWrapper'
import { MainInfo } from './Components/MainInfo'
import useGetDataTMDB from './Hooks/UseGetDataTMDB'
import './Detailes.scss'

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

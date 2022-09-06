import React, { useMemo } from 'react'
import { Helmet } from 'react-helmet'
import Header from 'Components/UI/Header/Header'
import Slider from 'Components/UI/Slider/Slider'
import ShowEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/ShowEpisodes'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import ScrollToTopOnUpdate from 'Utils/ScrollToTopOnUpdate'
import Footer from 'Components/UI/Footer/Footer'
import PlaceholderLoadingFullInfo from 'Components/UI/Placeholders/PlaceholderLoadingFullInfo/PlaceholderLoadingFullInfo'
import { useAppSelector } from 'app/hooks'
import { selectShowsLoading } from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import PosterWrapper from './Components/PosterWrapper'
import { MainInfo } from './Components/MainInfo'
import useGetDataTMDB from './Hooks/UseGetDataTMDB'
import useFetchShowEpisodes from './Hooks/UseFetchShowEpisodes'
import './Details.scss'

type Props = {
  match: { params: { id: string; mediaType: string } }
}

export const DetailsPage: React.FC<Props> = ({
  match: {
    params: { id, mediaType },
  },
}) => {
  const [details, loadingTMDB, similarContent, error] = useGetDataTMDB({ id, mediaType })
  const seasonsTMDB = useMemo(() => details.seasons.filter((item) => item.name !== 'Specials'), [details.seasons])

  const showsInitialLoading = useAppSelector(selectShowsLoading)
  const { loadingFireEpisodes } = useFetchShowEpisodes({ mediaType: details.mediaType, id: details.id })

  const renderDetails = () => {
    if (error) {
      return (
        <div className="details-page__error">
          <h1>{error}</h1>
        </div>
      )
    }

    if (loadingTMDB || showsInitialLoading || loadingFireEpisodes) {
      return <PlaceholderLoadingFullInfo delayAnimation="0.4s" />
    }

    return (
      <div className="details-page">
        <PosterWrapper details={details} />
        <MainInfo details={details} showId={Number(details.id)} />

        <div className="details-page__description">{details.overview}</div>

        {details.mediaType === 'show' && (
          <ShowEpisodes key={details.id} seasonsTMDB={seasonsTMDB} showId={Number(details.id)} />
        )}
        {similarContent.length && (
          <div className="details-page__slider">
            <div className="details-page__slider-title">
              {details.mediaType === 'movie' ? 'Similar movies' : 'Similar shows'}
            </div>

            <Slider sliderData={similarContent} />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Helmet>
        {details && (
          <title>
            {details.mediaType === 'show'
              ? `
                ${details.name}
                ${details.first_air_date?.slice(0, 4)} | TV Junkie
              `
              : `
              ${details.title}
              ${details.release_date?.slice(0, 4)} | TV Junkie
              `}
          </title>
        )}
      </Helmet>
      <Header isLogoVisible={false} />
      <div className="details-page-container">{renderDetails()}</div>
      <Footer />
      <ScrollToTopBar />
      <ScrollToTopOnUpdate />
    </>
  )
}
export default DetailsPage

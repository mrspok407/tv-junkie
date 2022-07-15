/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import Header from 'Components/UI/Header/Header'
import Slider from 'Components/UI/Slider/Slider'
import ShowEpisodes from 'Components/UI/Templates/SeasonsAndEpisodes/ShowEpisodes'
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
import useFetchShowEpisodes from './Hooks/UseFetchShowEpisodes'
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
  const { loadingFireEpisodes } = useFetchShowEpisodes({ mediaType, id })

  // const episodesRef = useRef<HTMLDivElement>(null)

  useGoogleRedirect()

  const [episodesRef, setEpisodesRef] = useState<any>(null)
  const episodesRefCallback = useCallback((node: any) => {
    console.log({ node })
    if (node !== null) {
      setEpisodesRef(node)
    }
  }, [])

  useLayoutEffect(() => {
    // if (!currentlyOpenSeasons.length) return
    console.log({ episodesRef })
    const refTop = episodesRef?.getBoundingClientRect().top
    console.log(refTop)
    setTimeout(() => {
      console.log('setTimeout')
      episodesRef?.scrollIntoView({ block: 'start' })
    }, 2500)
  }, [episodesRef])

  const renderDetailes = () => {
    if (error) {
      return (
        <div className="detailes-page__error">
          <h1>{error}</h1>
        </div>
      )
    }

    if (loadingTMDB || showsInitialLoading || loadingFireEpisodes) {
      return <PlaceholderLoadingFullInfo delayAnimation="0.4s" />
    }

    return (
      <div className="detailes-page">
        <PosterWrapper detailes={detailes} mediaType={mediaType} />
        <MainInfo detailes={detailes} mediaType={mediaType} id={Number(id)} />

        <div className="detailes-page__description">{detailes.overview}</div>

        {mediaType === 'show' && (
          <ShowEpisodes
            key={detailes.id}
            parentComponent="detailesPage"
            episodesData={detailes.seasons}
            showTitle={detailes.name}
            id={Number(id)}
            episodesRef={episodesRefCallback}
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
    )
  }

  return (
    <>
      <Helmet>
        {detailes && (
          <title>
            {mediaType === 'show'
              ? `
                ${detailes.name}
                ${detailes.first_air_date?.slice(0, 4)} | TV Junkie
              `
              : `
              ${detailes.title}
              ${detailes.release_date?.slice(0, 4)} | TV Junkie
              `}
          </title>
        )}
      </Helmet>
      <Header isLogoVisible={false} />

      <div className="detailes-page-container">{renderDetailes()}</div>
      <Footer />
      <ScrollToTopBar />
      {/* <ScrollToTopOnUpdate /> */}
    </>
  )
}
export default DetailesPage

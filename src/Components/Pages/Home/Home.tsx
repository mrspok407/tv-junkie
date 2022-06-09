import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import CalendarContent from 'Components/Pages/Calendar/CalendarContent'
import Slider from 'Components/UI/Slider/Slider'
import * as ROUTES from 'Utils/Constants/routes'
import Footer from 'Components/UI/Footer/Footer'
import ScrollToTopOnMount from 'Utils/ScrollToTopOnMount'
import useGoogleRedirect from 'Components/UserAuth/SignIn/UseGoogleRedirect'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import useAppSelectorArray from 'Utils/Hooks/UseAppSelectorArray'
import { ShowInfoStoreState, UserWillAirEpisodesInterface } from 'Components/UserContent/UseUserShowsRed/@Types'
import {
  selectEpisodes,
  selectShows,
  selectShowsLoading,
} from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import { useAppSelector } from 'app/hooks'
import PlaceholderHomePageNoFutureEpisodes from 'Components/UI/Placeholders/PlaceholderHomePageNoFutureEpisodes'
import useGetSlidersContent from './Hooks/UseGetSlidersContent'
import { organiseFutureEpisodesByMonth } from '../Calendar/CalendarHelpers'
import './Home.scss'

const HomePage: React.FC = () => {
  const { authUser, userContentHandler } = useFrequentVariables()
  const { sliders, slidersLoading } = useGetSlidersContent()

  const userShows = useAppSelectorArray<ShowInfoStoreState>(selectShows)
  const userEpisodes = useAppSelector(selectEpisodes)
  const watchingShows = userShows.filter((show) => show.database === 'watchingShows')
  const willAirEpisodesData: UserWillAirEpisodesInterface[] = organiseFutureEpisodesByMonth(watchingShows, userEpisodes)
  const willAirEpisodes = willAirEpisodesData.slice(0, 2)

  const showsInitialLoading = useAppSelector(selectShowsLoading)

  useGoogleRedirect()

  const renderNonAuthUser = () => (
    <>
      <div className="home-page__heading">
        <h1>With this app you can</h1>

        <div className="home-page__heading-features">
          <ul className="home-page__heading-list">
            <li className="home-page__heading-item">Keep track of your watching or finished shows</li>
            <li className="home-page__heading-item">Check episodes you watched</li>
            <li className="home-page__heading-item">Get list of all episodes you haven&apos;t watched yet</li>
          </ul>
          <ul className="home-page__heading-list">
            <li className="home-page__heading-item">See dates of upcoming episodes</li>
            <li className="home-page__heading-item">Also, you can add some movies to watch later</li>
            <li className="home-page__heading-item">Made with React + Firebase</li>
          </ul>
        </div>
        <div className="home-page__heading-register">
          <Link to={ROUTES.LOGIN_PAGE} className="home-page__heading-link">
            Register
          </Link>{' '}
          to get access to full features
        </div>
      </div>

      {!slidersLoading && (
        <div className="home-page__sliders home-page__sliders--non-auth">
          {Object.values(sliders).map((value) => (
            <div key={value.name} className="home-page__slider">
              <h2 className="home-page__slider-heading">{value.name}</h2>
              <Slider sliderData={value.data} />
            </div>
          ))}
        </div>
      )}
    </>
  )

  const renderAuthUser = () => (
    <>
      {!showsInitialLoading && !userContentHandler.loadingShowsOnRegister && (
        <>
          {willAirEpisodes.length > 0 ? (
            <div className="home-page__heading">
              <h1>Soon to watch</h1>
            </div>
          ) : (
            <PlaceholderHomePageNoFutureEpisodes />
          )}
        </>
      )}

      <CalendarContent homePage />

      <div className="home-page__sliders-wrapper">
        {!slidersLoading && (
          <div className="home-page__sliders">
            {Object.values(sliders).map((value) => (
              <div key={value.name} className="home-page__slider">
                <h2 className="home-page__slider-heading">{value.name}</h2>
                <Slider sliderData={value.data} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )

  return (
    <>
      <ScrollToTopOnMount />
      <Helmet>
        <meta charSet="utf-8" />
        <title>TV Junkie</title>
      </Helmet>
      <Header />
      <div className="home-page__wrapper">{!authUser?.uid ? renderNonAuthUser() : renderAuthUser()}</div>
      <Footer />
      <ScrollToTopBar />
    </>
  )
}

export default HomePage

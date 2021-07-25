import React, { useContext } from "react"
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"
import ScrollToTopBar from "Utils/ScrollToTopBar"
import Header from "Components/UI/Header/Header"
import CalendarContent from "Components/Pages/Calendar/CalendarContent"
import Slider from "Utils/Slider/Slider"
import PlaceholderHomePageNoFutureEpisodes from "Components/UI/Placeholders/PlaceholderHomePageNoFutureEpisodes"
import * as ROUTES from "Utils/Constants/routes"
import Footer from "Components/UI/Footer/Footer"
import { AppContext } from "Components/AppContext/AppContextHOC"
import ScrollToTopOnMount from "Utils/ScrollToTopOnMount"
import useGetSlidersContent from "./UseGetSlidersContent"
import useGoogleRedirect from "Components/UserAuth/SignIn/UseGoogleRedirect"
import "./Home.scss"

const HomePage: React.FC = () => {
  const { sliders, slidersLoading } = useGetSlidersContent()
  const context = useContext(AppContext)
  const { authUser } = context

  useGoogleRedirect()

  const renderNonAuthUser = () => (
    <>
      <div className="home-page__heading">
        <h1>With this app you can</h1>

        <div className="home-page__heading-features">
          <ul className="home-page__heading-list">
            <li className="home-page__heading-item">Keep track of your watching or finished shows</li>
            <li className="home-page__heading-item">Check episodes you watched</li>
            <li className="home-page__heading-item">Get list of all episodes you haven't watched yet</li>
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
          </Link>{" "}
          to get access to full features
        </div>
      </div>

      {!slidersLoading && (
        <div className="home-page__sliders home-page__sliders--non-auth">
          {Object.values(sliders).map((value) => {
            return (
              <div key={value.name} className="home-page__slider">
                <h2 className="home-page__slider-heading">{value.name}</h2>
                <Slider sliderData={value.data} />
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  const renderAuthUser = () => (
    <>
      {!context.userContent.loadingShows && !context.userContentHandler.loadingShowsOnRegister && (
        <>
          {context.userContent.userWillAirEpisodes.length > 0 ? (
            <div className="home-page__heading">
              <h1>Soon to watch</h1>
            </div>
          ) : (
            <PlaceholderHomePageNoFutureEpisodes />
          )}
        </>
      )}

      <CalendarContent homePage={true} />

      {/* {showsIds.map((id: any) => (
        <Test key={id} id={id} />
      ))} */}

      <div className="home-page__sliders-wrapper">
        {!slidersLoading && (
          <div className="home-page__sliders">
            {Object.values(sliders).map((value) => {
              return (
                <div key={value.name} className="home-page__slider">
                  <h2 className="home-page__slider-heading">{value.name}</h2>
                  <Slider sliderData={value.data} />
                </div>
              )
            })}
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
      <div className="home-page__wrapper">{!authUser ? renderNonAuthUser() : renderAuthUser()}</div>
      <Footer />
      <ScrollToTopBar />
    </>
  )
}

export default HomePage

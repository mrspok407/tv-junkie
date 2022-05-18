import React from "react"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import Header from "Components/UI/Header/Header"
import ToWatchEpisodesContent from "./ToWatchEpisodesContent"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import Footer from "Components/UI/Footer/Footer"
import { AuthUserInterface } from "Components/UserAuth/Session/WithAuthentication/@Types"
import "./ToWatchEpisodes.scss"

const ToWatchEpisodesPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Shows to watch | TV Junkie</title>
      </Helmet>
      <Header />
      <ToWatchEpisodesContent />
      <Footer />
      <ScrollToTop />
    </>
  )
}

const condition = (authUser: AuthUserInterface["authUser"]) => authUser !== null

export default WithAuthorization(condition)(ToWatchEpisodesPage)

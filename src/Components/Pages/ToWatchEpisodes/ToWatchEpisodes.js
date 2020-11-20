import React, { Component } from "react"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import Header from "Components/UI/Header/Header"
import ToWatchEpisodesContent from "./ToWatchEpisodesContent"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import Footer from "Components/UI/Footer/Footer"
import "./ToWatchEpisodes.scss"

class ToWatchEpisodesPage extends Component {
  render() {
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
}

const condition = (authUser) => authUser !== null

export default WithAuthorization(condition)(ToWatchEpisodesPage)

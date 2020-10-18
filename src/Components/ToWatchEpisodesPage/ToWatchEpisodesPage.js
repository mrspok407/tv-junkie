import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import HeaderBase from "Components/Header/Header"
import ToWatchEpisodesContent from "./ToWatchEpisodesContent"
import { compose } from "recompose"
import { WithAuthorization } from "Components/UserAuth/Session/WithAuthorization"
import "./ToWatchEpisodesPage.scss"
import Footer from "Components/Footer/Footer"

const Header = withFirebase(HeaderBase)

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

const condition = authUser => authUser !== null

export default compose(WithAuthorization(condition))(ToWatchEpisodesPage)

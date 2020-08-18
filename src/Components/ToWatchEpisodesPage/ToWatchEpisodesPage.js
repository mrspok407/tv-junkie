import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import ToWatchEpisodesContent from "./ToWatchEpisodesContent"
import { compose } from "recompose"
import { WithAuthorization } from "Components/UserAuth/Session/WithAuthorization"
import "./ToWatchEpisodesPage.scss"

const Header = withFirebase(HeaderBase)

class ToWatchEpisodesPage extends Component {
  render() {
    return (
      <>
        <Header />
        <ToWatchEpisodesContent />
        <ScrollToTop />
      </>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(WithAuthorization(condition))(ToWatchEpisodesPage)

import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import HeaderBase from "Components/Header/Header"
import CalendarContent from "./CalendarContent"
import "./CalendarPage.scss"
import { compose } from "recompose"
import { WithAuthorization } from "Components/UserAuth/Session/WithAuthorization"
import Footer from "Components/Footer/Footer"

const Header = withFirebase(HeaderBase)

class CalendarPage extends Component {
  render() {
    return (
      <>
        <Helmet>
          <title>Calendar of upcoming shows | TV Junkie</title>
        </Helmet>
        <Header />
        <CalendarContent />
        <Footer />
        <ScrollToTop />
      </>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(WithAuthorization(condition))(CalendarPage)

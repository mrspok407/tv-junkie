import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import HeaderBase from "Components/UI/Header/Header"
import CalendarContent from "./CalendarContent"
import { compose } from "recompose"
import { WithAuthorization } from "Components/UserAuth/Session/WithAuthorization"
import Footer from "Components/UI/Footer/Footer"
import "./Calendar.scss"

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

const condition = (authUser) => authUser !== null

export default compose(WithAuthorization(condition))(CalendarPage)

import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import CalendarContent from "./CalendarContent"
import "./CalendarPage.scss"
import { compose } from "recompose"
import { WithAuthorization } from "Components/UserAuth/Session/WithAuthorization"

const Header = withFirebase(HeaderBase)

class CalendarPage extends Component {
  render() {
    return (
      <>
        <Header />
        <CalendarContent />
        <ScrollToTop />
      </>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(WithAuthorization(condition))(CalendarPage)

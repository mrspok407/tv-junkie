import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import CalendarContent from "./CalendarContent"
import "./CalendarPage.scss"

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

export default CalendarPage

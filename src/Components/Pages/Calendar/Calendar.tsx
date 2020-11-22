import React from "react"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import Header from "Components/UI/Header/Header"
import CalendarContent from "./CalendarContent"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import Footer from "Components/UI/Footer/Footer"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import "./Calendar.scss"

const CalendarPage: React.FC = () => {
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

const condition = (authUser: AuthUserInterface) => authUser !== null

export default WithAuthorization(condition)(CalendarPage)

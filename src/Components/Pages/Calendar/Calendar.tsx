import React from 'react'
import { Helmet } from 'react-helmet-async'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import useAuthorization from 'Components/UserAuth/Session/Authentication/Hooks/useAuthorization'
import Footer from 'Components/UI/Footer/Footer'
import ScrollToTopOnMount from 'Utils/ScrollToTopOnMount'
import CalendarContent from './CalendarContent'
import './Calendar.scss'

const CalendarPage: React.FC = () => {
  const isAuthorize = useAuthorization({})
  if (!isAuthorize) return null
  return (
    <>
      <Helmet>
        <title>Calendar of upcoming shows | TV Junkie</title>
      </Helmet>
      <Header />
      <CalendarContent />
      <Footer />
      <ScrollToTopBar />
      <ScrollToTopOnMount />
    </>
  )
}

export default CalendarPage

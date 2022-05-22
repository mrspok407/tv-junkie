import React from 'react'
import { Helmet } from 'react-helmet'
import ScrollToTop from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import WithAuthorization from 'Components/UserAuth/Session/WithAuthorization/WithAuthorization'
import Footer from 'Components/UI/Footer/Footer'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import CalendarContent from './CalendarContent'
import './Calendar.scss'

const CalendarPage: React.FC = () => (
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

const condition = (authUser: AuthUserInterface['authUser']) => authUser !== null

export default WithAuthorization(condition)(CalendarPage)

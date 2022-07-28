import React from 'react'
import { Helmet } from 'react-helmet'
import ScrollToTop from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import Footer from 'Components/UI/Footer/Footer'
import useGoogleRedirect from 'Components/UserAuth/SignIn/UseGoogleRedirect'
import ShowsContent from './ShowsContent'

const Shows: React.FC = () => {
  useGoogleRedirect()
  return (
    <>
      <Helmet>
        <title>All your shows | TV Junkie</title>
      </Helmet>
      <Header />
      <ShowsContent />
      <Footer />
      <ScrollToTop />
    </>
  )
}

export default Shows

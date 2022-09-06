import React from 'react'
import { Helmet } from 'react-helmet'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import ScrollToTopOnMount from 'Utils/ScrollToTopOnMount'
import Footer from 'Components/UI/Footer/Footer'
import ShowsContent from './ShowsContent'

const Shows: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>All your shows | TV Junkie</title>
      </Helmet>
      <Header />
      <ShowsContent />
      <Footer />
      <ScrollToTopBar />
      <ScrollToTopOnMount />
    </>
  )
}

export default Shows

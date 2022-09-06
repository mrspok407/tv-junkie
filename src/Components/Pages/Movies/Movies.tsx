/* eslint-disable max-len */
import React from 'react'
import { Helmet } from 'react-helmet'
import Header from 'Components/UI/Header/Header'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import ScrollToTopOnMount from 'Utils/ScrollToTopOnMount'
import Footer from 'Components/UI/Footer/Footer'
import MoviesContent from './MoviesContent'

const Movies: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>All your movies | TV Junkie</title>
      </Helmet>
      <Header />
      <MoviesContent />
      <Footer />
      <ScrollToTopBar />
      <ScrollToTopOnMount />
    </>
  )
}

export default Movies

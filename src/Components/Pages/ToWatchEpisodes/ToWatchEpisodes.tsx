import React from 'react'
import { Helmet } from 'react-helmet-async'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import Footer from 'Components/UI/Footer/Footer'
import ScrollToTopOnMount from 'Utils/ScrollToTopOnMount'
import useAuthorization from 'Components/UserAuth/Session/Authentication/Hooks/useAuthorization'
import ToWatchEpisodesContent from './ToWatchEpisodesContent'
import './ToWatchEpisodes.scss'

const ToWatchEpisodesPage: React.FC = () => {
  const isAuthorize = useAuthorization({})
  if (!isAuthorize) return null

  return (
    <>
      <Helmet>
        <title>Shows to watch | TV Junkie</title>
      </Helmet>
      <Header />
      <ToWatchEpisodesContent />
      <Footer />
      <ScrollToTopBar />
      <ScrollToTopOnMount />
    </>
  )
}

export default ToWatchEpisodesPage

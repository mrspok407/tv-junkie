import React from 'react'
import Header from 'Components/UI/Header/Header'
import Footer from 'Components/UI/Footer/Footer'
import { Helmet } from 'react-helmet'
import useAuthorization from 'Components/UserAuth/Session/Authentication/Hooks/useAuthorization'
import SettingsContent from './SettingsContent'

const SettingsPage: React.FC = () => {
  const isAuthorize = useAuthorization({})
  if (!isAuthorize) return null
  return (
    <>
      <Helmet>
        <title>Settings | TV Junkie</title>
      </Helmet>
      <Header />
      <SettingsContent />
      <Footer />
    </>
  )
}

export default SettingsPage

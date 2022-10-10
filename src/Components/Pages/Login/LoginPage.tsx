import React from 'react'
import useAuthorization from 'Components/UserAuth/Session/Authentication/Hooks/useAuthorization'
import { Helmet } from 'react-helmet-async'
import Header from 'Components/UI/Header/Header'
import ScrollToTopOnMount from 'Utils/ScrollToTopOnMount'
import Footer from 'Components/UI/Footer/Footer'
import LoginContent from './LoginContent'

const LoginPage: React.FC = () => {
  const isAuthorize = useAuthorization({ isAuthThenPush: true })
  if (isAuthorize) return null

  return (
    <>
      <Helmet>
        <title>Login | TV Junkie</title>
      </Helmet>
      <Header isLogoVisible={false} hideLogin />
      <LoginContent />
      <Footer />
      <ScrollToTopOnMount />
    </>
  )
}

export default LoginPage

import React from "react"
import { withFirebase } from "Components/Firebase"
import { Helmet } from "react-helmet"
import UserAuthForm from "Components/UI/UserAuthForm/UserAuthForm"
import HeaderBase from "Components/UI/Header/Header"
import ScrollToTopOnMount from "Utils/ScrollToTopOnMount"
import Footer from "Components/UI/Footer/Footer"
import "./Login.scss"

const Header = withFirebase(HeaderBase)

const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Login | TV Junkie</title>
      </Helmet>
      <Header isLogoVisible={false} hideLogin={true} />
      <div className="login-page">
        <UserAuthForm loginPage={true} activeSection="register" />
      </div>
      <Footer />
      <ScrollToTopOnMount />
    </>
  )
}

export default LoginPage

import React, { useEffect } from "react"
import { useHistory } from "react-router-dom"
import { withFirebase } from "Components/Firebase"
import { compose } from "recompose"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import { Helmet } from "react-helmet"
import UserAuthForm from "Components/UserAuth/UserAuthForm"
import * as ROUTES from "Utils/Constants/routes"
import HeaderBase from "Components/Header/Header"
import ScrollToTopOnMount from "Utils/ScrollToTopOnMount"
import "./LoginPage.scss"
import Footer from "Components/Footer/Footer"

const Header = withFirebase(HeaderBase)

const LoginPage = ({ firebase }) => {
  const history = useHistory()

  const authListener = firebase.auth.onAuthStateChanged((authUser) => {
    if (authUser) {
      history.push(ROUTES.HOME_PAGE)
    }
  })

  useEffect(() => {
    authListener()
    // eslint-disable-next-line
  }, [])

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

export default compose(withFirebase, WithAuthenticationConsumer)(LoginPage)

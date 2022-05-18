import React, { useEffect } from "react"
import { Helmet } from "react-helmet"
import * as ROUTES from "Utils/Constants/routes"
import UserAuthForm from "Components/UI/UserAuthForm/UserAuthForm"
import Header from "Components/UI/Header/Header"
import ScrollToTopOnMount from "Utils/ScrollToTopOnMount"
import Footer from "Components/UI/Footer/Footer"
import { useHistory } from "react-router-dom"
import { AuthUserInterface } from "Components/UserAuth/Session/WithAuthentication/@Types"
import useGoogleRedirect from "Components/UserAuth/SignIn/UseGoogleRedirect"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import "./Login.scss"

const LoginPage: React.FC = () => {
  const { firebase, authUser } = useFrequentVariables()
  const history = useHistory()

  useGoogleRedirect()

  useEffect(() => {
    let authSubscriber: any

    const authorizationListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        (authUser: AuthUserInterface["authUser"]) => {
          if (authUser !== null) {
            history.push(ROUTES.HOME_PAGE)
          }
        },
        () => {}
      )
    }

    authorizationListener()
    return () => {
      authSubscriber()
    }
  }, [firebase, history])

  if (authUser !== null) {
    return null
  }

  return (
    <>
      <Helmet>
        <title>Login | TV Junkie</title>
      </Helmet>
      <Header isLogoVisible={false} hideLogin={true} />
      <div className="login-page">
        <UserAuthForm loginPage={true} />
      </div>
      <Footer />
      <ScrollToTopOnMount />
    </>
  )
}

export default LoginPage

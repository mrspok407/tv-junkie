import React, { useContext, useEffect } from "react"
import { Helmet } from "react-helmet"
import * as ROUTES from "Utils/Constants/routes"
import UserAuthForm from "Components/UI/UserAuthForm/UserAuthForm"
import Header from "Components/UI/Header/Header"
import ScrollToTopOnMount from "Utils/ScrollToTopOnMount"
import Footer from "Components/UI/Footer/Footer"
import { FirebaseContext } from "Components/Firebase"
import { useHistory } from "react-router-dom"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import { AppContext } from "Components/AppContext/AppContextHOC"
import useGoogleRedirect from "Components/UserAuth/SignIn/UseGoogleRedirect"
import "./Login.scss"

const LoginPage: React.FC = () => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const history = useHistory()

  useGoogleRedirect()

  useEffect(() => {
    let authSubscriber: any

    const authorizationListener = () => {
      authSubscriber = firebase.onAuthUserListener(
        (authUser: AuthUserInterface) => {
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

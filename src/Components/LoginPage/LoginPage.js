import React, { useEffect } from "react"
import { useHistory } from "react-router-dom"
import UserAuthForm from "Components/UserAuth/UserAuthForm"
import * as ROUTES from "Utils/Constants/routes"
import HeaderBase from "Components/Header/Header"
import { withFirebase } from "Components/Firebase"
import ScrollToTopOnMount from "Utils/ScrollToTopOnMount"
import { compose } from "recompose"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import "./LoginPage.scss"

const Header = withFirebase(HeaderBase)

const LoginPage = ({ firebase }) => {
  const history = useHistory()

  const authListener = firebase.auth.onAuthStateChanged(authUser => {
    if (authUser) {
      history.push(ROUTES.HOME_PAGE)
    }
  })

  useEffect(() => {
    authListener()
  }, [authListener])

  return (
    <>
      <Header isLogoVisible={false} hideLogin={true} />
      <div className="login-page">
        <UserAuthForm loginPage={true} activeSection="register" />
      </div>
      <ScrollToTopOnMount />
    </>
  )
}

// const condition = authUser => authUser !== null

export default compose(withFirebase, WithAuthenticationConsumer)(LoginPage)

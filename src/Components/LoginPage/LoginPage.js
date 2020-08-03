import React from "react"
import UserAuthForm from "Components/UserAuth/UserAuthForm"
import "./LoginPage.scss"
import HeaderBase from "Components/Header/Header"
import { withFirebase } from "Components/Firebase"

const Header = withFirebase(HeaderBase)

export default function LoginPage() {
  return (
    <>
      <Header isLogoVisible={false} hideLogin={true} />
      <div className="login-page">
        <UserAuthForm loginPage={true} activeSection="register" />
      </div>
    </>
  )
}

import React, { useState } from "react"
import classNames from "classnames"
import Register from "Components/UserAuth/Register/Register"
import SignInForm from "Components/UserAuth/SignIn/SignIn"
import PasswordForget from "Components/UserAuth/PasswordForget/PasswordForget"
import "./UserAuthForm.scss"

type Props = {
  closeNavMobile: () => void
  loginPage: boolean
  authContRef: string | ((instance: HTMLDivElement | null) => void)
}

const UserAuthForm: React.FC<Props> = ({ closeNavMobile, loginPage, authContRef }) => {
  const [activeSection, setActiveSection] = useState(loginPage ? "register" : "signIn")
  const [passwordForgetFormOpen, setPasswordforgetFormOpen] = useState(false)

  const togglePasswordForget = () => {
    setPasswordforgetFormOpen(!passwordForgetFormOpen)
  }

  const renderSection = () => {
    return activeSection === "signIn" ? (
      <>
        <div className="auth__section">
          <SignInForm togglePasswordForget={togglePasswordForget} closeNavMobile={closeNavMobile} />
        </div>
        {passwordForgetFormOpen && (
          <div className="auth__section">
            <PasswordForget />
          </div>
        )}
      </>
    ) : (
      activeSection === "register" && (
        <div className="auth__section">
          <Register closeNavMobile={closeNavMobile} />
        </div>
      )
    )
  }

  return (
    <div
      ref={authContRef}
      className={classNames("auth", {
        "auth--login-page": loginPage
      })}
    >
      <div className="auth__nav">
        <div
          onClick={() => setActiveSection("signIn")}
          className={classNames("auth__nav-btn", {
            "auth__nav-btn--active": activeSection === "signIn"
          })}
        >
          Sign In
        </div>
        <div
          onClick={() => setActiveSection("register")}
          className={classNames("auth__nav-btn", {
            "auth__nav-btn--active": activeSection === "register"
          })}
        >
          Register
        </div>
      </div>
      {renderSection()}
    </div>
  )
}

export default UserAuthForm

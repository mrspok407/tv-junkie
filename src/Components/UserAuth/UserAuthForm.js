import React, { Component } from "react"
import classNames from "classnames"
import Register from "Components/UserAuth/Register/Register"
import SignInForm from "Components/UserAuth/SignIn/SignIn"
import PasswordForget from "Components/UserAuth/PasswordForget/PasswordForget"
import "./UserAuth.scss"

export default class UserAuthForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      activeSection: "signIn",
      passwordForgetFormOpen: false
    }
  }

  componentDidMount() {
    if (this.props.activeSection === "register") {
      this.setState({ activeSection: "register" })
    }
  }

  togglePasswordForget = () => {
    this.setState({ passwordForgetFormOpen: !this.state.passwordForgetFormOpen })
  }

  renderSection = () => {
    return this.state.activeSection === "signIn" ? (
      <>
        <div className="auth__section">
          <SignInForm
            togglePasswordForget={this.togglePasswordForget}
            closeNavMobile={this.props.closeNavMobile}
          />
        </div>
        {this.state.passwordForgetFormOpen && (
          <div className="auth__section">
            <PasswordForget />
          </div>
        )}
      </>
    ) : (
      this.state.activeSection === "register" && (
        <div className="auth__section">
          <Register closeNavMobile={this.props.closeNavMobile} />
        </div>
      )
    )
  }

  render() {
    return (
      <div
        ref={this.props.authContRef}
        className={classNames("auth", {
          "auth--login-page": this.props.loginPage
        })}
      >
        <div className="auth__nav">
          <div
            onClick={() => this.setState({ activeSection: "signIn" })}
            className={classNames("auth__nav-btn", {
              "auth__nav-btn--active": this.state.activeSection === "signIn"
            })}
          >
            Sign In
          </div>
          <div
            onClick={() => this.setState({ activeSection: "register" })}
            className={classNames("auth__nav-btn", {
              "auth__nav-btn--active": this.state.activeSection === "register"
            })}
          >
            Register
          </div>
        </div>
        {this.renderSection()}
      </div>
    )
  }
}

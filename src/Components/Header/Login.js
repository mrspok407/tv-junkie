import React, { Component } from "react"
import classNames from "classnames"
import Register from "Components/UserAuth/Register/Register"
import SignInForm from "Components/UserAuth/SignIn/SignIn"
import PasswordForget from "Components/UserAuth/PasswordForget/PasswordForget"
import "../UserAuth/UserAuth.scss"

export default class Login extends Component {
  constructor(props) {
    super(props)

    this.state = {
      authContOpen: false,
      activeSection: "signIn",
      passwordForgetFormOpen: false
    }
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  handleClickOutside = e => {
    if (this.loginButtonRef === e.target || !this.authContRef || this.authContRef.contains(e.target)) return
    this.setState({
      authContOpen: false
    })
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
            clearCurrentlyChosenContent={this.props.clearCurrentlyChosenContent}
          />
        </div>
        {this.state.passwordForgetFormOpen ? (
          <div className="auth__section">
            <PasswordForget />
          </div>
        ) : (
          ""
        )}
      </>
    ) : (
      this.state.activeSection === "Register" && (
        <div className="auth__section">
          <Register clearCurrentlyChosenContent={this.props.clearCurrentlyChosenContent} />
        </div>
      )
    )
  }

  renderAuthContainer = () => {
    if (!this.state.authContOpen) return null

    return (
      <div
        ref={_authCont => {
          this.authContRef = _authCont
        }}
        className="auth"
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
            onClick={() => this.setState({ activeSection: "Register" })}
            className={classNames("auth__nav-btn", {
              "auth__nav-btn--active": this.state.activeSection === "Register"
            })}
          >
            Register
          </div>
        </div>
        {this.renderSection()}
      </div>
    )
  }

  render() {
    return (
      <div className="login__container">
        <div
          ref={_loginButton => {
            this.loginButtonRef = _loginButton
          }}
          onClick={() => this.setState({ authContOpen: !this.state.authContOpen })}
          className="nav__item nav__item--login"
        >
          Login
        </div>
        {this.renderAuthContainer()}
      </div>
    )
  }
}

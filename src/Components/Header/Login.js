/* eslint-disable import/no-cycle */
import React, { Component } from "react"
import SignUpForm from "../UserAuth/SignUp/SignUp"
import SignInForm from "../UserAuth/SignIn/SignIn"

export default class Login extends Component {
  constructor(props) {
    super(props)

    this.state = {
      authContOpen: true,
      signInOpen: false
    }

    this.authContRef = React.createRef()
    this.loginButtonRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  toggleAuthContainer = () => {
    this.setState(prevState => ({ authContOpen: !prevState.authContOpen }))
  }

  handleClickOutside = e => {
    if (this.loginButtonRef.current === e.target) return
    if (this.authContRef.current && !this.authContRef.current.contains(e.target)) {
      this.setState({
        authContOpen: false
      })
    }
  }

  render() {
    return (
      <div className="nav__item--login">
        <div
          ref={this.loginButtonRef}
          onClick={() => this.toggleAuthContainer()}
          className="nav__item nav__login-button"
        >
          Login
        </div>
        {this.state.authContOpen && (
          <div ref={this.authContRef} className="nav__login-auth-container">
            <div className="nav__login-auth">
              <div
                onClick={() => this.setState({ signInOpen: true })}
                className={
                  this.state.signInOpen ? "nav__login--sign sign--active" : "nav__login--sign"
                }
              >
                Sign In
              </div>
              <div
                onClick={() => this.setState({ signInOpen: false })}
                className={
                  !this.state.signInOpen ? "nav__login--sign sign--active" : "nav__login--sign"
                }
              >
                Sign Up
              </div>
            </div>
            {this.state.signInOpen ? (
              <div className="nav__login-form nav__login-form--signin">
                <SignInForm />
              </div>
            ) : (
              <div className="nav__login-form nav__login-form--signin">
                <SignUpForm />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

import React, { Component } from "react"
import UserAuthForm from "Components/UI/UserAuthForm/UserAuthForm"

export default class Login extends Component {
  constructor(props) {
    super(props)

    this.state = {
      authContOpen: false
    }

    this.authContRef = React.createRef()
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  handleClickOutside = (e) => {
    if (
      this.loginButtonRef === e.target ||
      !this.authContRef.current ||
      this.authContRef.current.contains(e.target)
    ) {
      return
    }

    this.setState({
      authContOpen: false
    })
  }

  render() {
    return (
      <div className="login__container">
        <div
          ref={(_loginButton) => {
            this.loginButtonRef = _loginButton
          }}
          onClick={() => this.setState({ authContOpen: !this.state.authContOpen })}
          className="nav__item nav__item--login"
        >
          Login
        </div>
        {this.state.authContOpen && (
          <UserAuthForm authContRef={this.authContRef} closeNavMobile={this.props.closeNavMobile} />
        )}
      </div>
    )
  }
}

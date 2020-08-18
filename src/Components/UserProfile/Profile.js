import React, { Component } from "react"
import { compose } from "recompose"
import SignOutButton from "Components/UserAuth/SignOut/SignOutButton"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"
import Header from "Components/Header/Header"
import "./Profile.scss"

class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      verificationSent: false
    }
  }

  sendEmailVerification = () => {
    this.props.firebase.sendEmailVerification()
    this.setState({ verificationSent: true })
  }

  render() {
    return (
      <>
        <Header />
        <div className="user-profile">
          <div className="user-profile__email">
            Sign in with <span>{this.props.authUser.email}</span>
          </div>
          <div className="user-profile__verified">
            {this.props.authUser.emailVerified ? (
              "Email verified"
            ) : (
              <>
                Email not verified{" "}
                <button onClick={this.sendEmailVerification} className="button" type="button">
                  {this.state.verificationSent ? "Verification sent" : "Send email verification"}
                </button>
              </>
            )}
          </div>
          <div className="user-profile__signout">
            <SignOutButton />
          </div>
          <div></div>
        </div>
      </>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(WithAuthenticationConsumer, WithAuthorization(condition))(Profile)

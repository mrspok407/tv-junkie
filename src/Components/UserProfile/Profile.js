import React, { Component } from "react"
import { compose } from "recompose"
import SignOutButton from "Components/UserAuth/SignOut/SignOutButton"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import { WithAuthenticationConsumer } from "Components/UserAuth/Session/WithAuthentication"

class Profile extends Component {
  render() {
    const userEmail = this.props.authUser.email
    console.log(this.props.authUser)
    return (
      <div>
        <SignOutButton />
        {userEmail}
      </div>
    )
  }
}

const condition = authUser => authUser !== null

export default compose(WithAuthenticationConsumer, WithAuthorization(condition))(Profile)

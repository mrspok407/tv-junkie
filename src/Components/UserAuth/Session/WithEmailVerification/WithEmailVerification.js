import React from "react"
import { compose } from "recompose"
import { withFirebase } from "Components/Firebase"
import { WithAuthenticationConsumer } from "../WithAuthentication"

export const withEmailVerification = Component => {
  class WithEmailVerification extends React.Component {
    render() {
      return <>{this.props.authUser.emailVerified ? <Component {...this.props} /> : "Email not verified"}</>
    }
  }
  return compose(withFirebase, WithAuthenticationConsumer)(WithEmailVerification)
}

export default withEmailVerification

import React from "react"
import { compose } from "recompose"
import { withFirebase } from "Components/Firebase"
import { WithAuthenticationConsumer } from "../WithAuthentication"
import { AppContext } from "Components/AppContext/AppContextHOC"

export const withEmailVerification = (Component) => {
  class WithEmailVerification extends React.Component {
    render() {
      return <>{this.context.authUser.emailVerified ? <Component {...this.props} /> : "Email not verified"}</>
    }
  }
  return WithEmailVerification
}

export default withEmailVerification
withEmailVerification.contextType = AppContext

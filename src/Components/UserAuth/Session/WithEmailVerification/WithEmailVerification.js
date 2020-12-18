import React from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"

export const withEmailVerification = (Component) => {
  class WithEmailVerification extends React.Component {
    render() {
      return <>{this.context.authUser.emailVerified ? <Component {...this.props} /> : "Email not verified"}</>
    }
  }
  WithEmailVerification.contextType = AppContext
  return WithEmailVerification
}

export default withEmailVerification

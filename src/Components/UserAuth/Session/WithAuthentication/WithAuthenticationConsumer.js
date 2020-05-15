import React from "react"
import AuthUserContext from "./AuthUserContext"

export const withAuthenticationConsumer = Component => props => (
  <AuthUserContext.Consumer>
    {authUser => <Component {...props} authUser={authUser} />}
  </AuthUserContext.Consumer>
)

export default withAuthenticationConsumer
